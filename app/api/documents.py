from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import AliasChoices, BaseModel, ConfigDict, Field
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models import Collection, Document, DocumentChunk, utcnow
from app.db.session import get_db
from app.schemas.documents import ChunkOut, DocumentOut, chunk_to_out, document_to_out
from app.services.extraction import detect_source_type

router = APIRouter()


class IngestUrlBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    url: str
    collection_id: str = Field(
        validation_alias=AliasChoices("collectionId", "collection_id"),
    )


@router.get("", response_model=list[DocumentOut], response_model_by_alias=True)
async def list_documents(db: AsyncSession = Depends(get_db)) -> list[DocumentOut]:
    r = await db.execute(
        select(Document).where(Document.deleted_at.is_(None)).order_by(Document.uploaded_at.desc())
    )
    return [document_to_out(d) for d in r.scalars().all()]


@router.post("/upload", response_model=DocumentOut, response_model_by_alias=True)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    collection_id: str = Form(...),
    db: AsyncSession = Depends(get_db),
) -> DocumentOut:
    try:
        coll = uuid.UUID(collection_id)
    except ValueError as e:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "collection_id must be a UUID") from e

    if not await db.get(Collection, coll):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "collection not found")

    settings = get_settings()
    raw_name = file.filename or "upload.bin"
    safe_name = Path(raw_name).name
    if not safe_name or safe_name in (".", ".."):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "invalid filename")

    doc_id = uuid.uuid4()
    dest = Path(settings.upload_dir).resolve() / str(doc_id) / safe_name
    dest.parent.mkdir(parents=True, exist_ok=True)

    body = await file.read()
    max_b = settings.max_upload_mb * 1024 * 1024
    if len(body) > max_b:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "file too large")

    dest.write_bytes(body)
    source_type = detect_source_type(safe_name)

    doc = Document(
        id=doc_id,
        filename=safe_name,
        source_type=source_type,
        collection_id=coll,
        status="pending",
        storage_path=str(dest),
        size_bytes=len(body),
        chunk_count=0,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    pool = getattr(request.app.state, "arq", None)
    if pool is None:
        doc.status = "failed"
        doc.error_message = "job queue unavailable"
        await db.commit()
        await db.refresh(doc)
        return document_to_out(doc)

    try:
        await pool.enqueue_job("ingest_document", str(doc.id))
    except Exception as exc:  # noqa: BLE001
        doc.status = "failed"
        doc.error_message = f"enqueue failed: {exc}"[:2000]
        await db.commit()
        await db.refresh(doc)

    return document_to_out(doc)


@router.get("/{document_id}", response_model=DocumentOut, response_model_by_alias=True)
async def get_document(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> DocumentOut:
    doc = await db.get(Document, document_id)
    if not doc or doc.deleted_at is not None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "document not found")
    return document_to_out(doc)


@router.get("/{document_id}/file")
async def get_document_file(
    document_id: uuid.UUID,
    download: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    doc = await db.get(Document, document_id)
    if not doc or doc.deleted_at is not None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "document not found")

    file_path = Path(doc.storage_path)
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "document file not found")

    media_type = {
        "pdf": "application/pdf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "txt": "text/plain",
    }.get((doc.source_type or "").lower(), "application/octet-stream")

    disposition = "attachment" if download else "inline"
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=doc.filename,
        headers={"Content-Disposition": f'{disposition}; filename="{doc.filename}"'},
    )


@router.get("/{document_id}/chunks", response_model=list[ChunkOut], response_model_by_alias=True)
async def get_chunks(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list[ChunkOut]:
    doc = await db.get(Document, document_id)
    if not doc or doc.deleted_at is not None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "document not found")
    r = await db.execute(
        select(DocumentChunk)
        .where(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.chunk_index)
    )
    return [chunk_to_out(c) for c in r.scalars().all()]


@router.post("/{document_id}/reindex", status_code=status.HTTP_204_NO_CONTENT)
async def reindex_document(
    request: Request,
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    doc = await db.get(Document, document_id)
    if not doc or doc.deleted_at is not None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "document not found")
    pool = getattr(request.app.state, "arq", None)
    if pool is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "job queue unavailable")
    try:
        await pool.enqueue_job("ingest_document", str(doc.id))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e)) from e


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    res = await db.execute(
        update(Document)
        .where(Document.id == document_id, Document.deleted_at.is_(None))
        .values(deleted_at=utcnow())
    )
    await db.commit()
    if res.rowcount:
        return
    doc = await db.get(Document, document_id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "document not found")
