from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.db.models import Document, DocumentChunk

DocStatus = Literal["pending", "parsing", "embedding", "ready", "failed"]
DocType = Literal["pdf", "docx", "txt"]
EmbeddingStatus = Literal["pending", "partial", "complete"]


class DocumentOut(BaseModel):
    model_config = ConfigDict(ser_json_by_alias=True, populate_by_name=True)

    id: str
    name: str
    type: DocType
    size_bytes: int = Field(serialization_alias="sizeBytes")
    uploaded_at: str = Field(serialization_alias="uploadedAt")
    collection_id: str = Field(serialization_alias="collectionId")
    status: DocStatus
    chunk_count: int = Field(serialization_alias="chunkCount")
    embedding_status: EmbeddingStatus = Field(serialization_alias="embeddingStatus")
    tags: list[str] = Field(default_factory=list)
    namespace: str | None = None


class ChunkOut(BaseModel):
    model_config = ConfigDict(ser_json_by_alias=True, populate_by_name=True)

    id: str
    document_id: str = Field(serialization_alias="documentId")
    index: int
    text: str
    embedding_status: Literal["complete", "pending"] = Field(
        default="complete", serialization_alias="embeddingStatus"
    )


def doc_type_for(filename: str, source_type: str | None) -> DocType:
    st = (source_type or "").lower()
    if st == "pdf" or filename.lower().endswith(".pdf"):
        return "pdf"
    if st == "docx" or filename.lower().endswith(".docx"):
        return "docx"
    return "txt"


def embedding_status_for(doc: Document) -> EmbeddingStatus:
    if doc.status == "ready":
        return "complete"
    if doc.status in ("embedding", "parsing"):
        return "partial"
    return "pending"


def document_to_out(doc: Document) -> DocumentOut:
    return DocumentOut(
        id=str(doc.id),
        name=doc.filename,
        type=doc_type_for(doc.filename, doc.source_type),
        size_bytes=doc.size_bytes,
        uploaded_at=doc.uploaded_at.isoformat() if doc.uploaded_at else "",
        collection_id=str(doc.collection_id),
        status=doc.status,  # type: ignore[arg-type]
        chunk_count=doc.chunk_count,
        embedding_status=embedding_status_for(doc),
        tags=[],
        namespace=None,
    )


def chunk_to_out(chunk: DocumentChunk) -> ChunkOut:
    return ChunkOut(
        id=str(chunk.id),
        document_id=str(chunk.document_id),
        index=chunk.chunk_index,
        text=chunk.content,
        embedding_status="complete",
    )
