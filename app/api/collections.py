from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Collection, Document
from app.db.session import get_db
from app.schemas.collections import (
    CollectionCreate,
    CollectionOut,
    CollectionPatch,
    apply_patch,
    collection_to_out,
    create_row,
)

router = APIRouter()


async def _doc_counts(session: AsyncSession) -> dict[uuid.UUID, int]:
    r = await session.execute(
        select(Document.collection_id, func.count(Document.id))
        .where(Document.deleted_at.is_(None))
        .group_by(Document.collection_id)
    )
    return {cid: int(n) for cid, n in r.all()}


@router.get("", response_model=list[CollectionOut], response_model_by_alias=True)
async def list_collections(db: AsyncSession = Depends(get_db)) -> list[CollectionOut]:
    rows = (await db.scalars(select(Collection).order_by(Collection.created_at.desc()))).all()
    counts = await _doc_counts(db)
    return [collection_to_out(c, counts.get(c.id, 0)) for c in rows]


@router.post("", response_model=CollectionOut, response_model_by_alias=True)
async def create_collection(
    body: CollectionCreate, db: AsyncSession = Depends(get_db)
) -> CollectionOut:
    row = create_row(body)
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return collection_to_out(row, 0)


@router.get("/{collection_id}", response_model=CollectionOut, response_model_by_alias=True)
async def get_collection(collection_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> CollectionOut:
    row = await db.get(Collection, collection_id)
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "collection not found")
    n = await db.scalar(
        select(func.count())
        .select_from(Document)
        .where(Document.collection_id == collection_id, Document.deleted_at.is_(None))
    )
    return collection_to_out(row, int(n or 0))


@router.put("/{collection_id}", response_model=CollectionOut, response_model_by_alias=True)
async def update_collection(
    collection_id: uuid.UUID, body: CollectionPatch, db: AsyncSession = Depends(get_db)
) -> CollectionOut:
    row = await db.get(Collection, collection_id)
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "collection not found")
    apply_patch(row, body)
    await db.commit()
    await db.refresh(row)
    n = await db.scalar(
        select(func.count())
        .select_from(Document)
        .where(Document.collection_id == collection_id, Document.deleted_at.is_(None))
    )
    return collection_to_out(row, int(n or 0))


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_collection(collection_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    row = await db.get(Collection, collection_id)
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "collection not found")
    n = await db.scalar(
        select(func.count())
        .select_from(Document)
        .where(Document.collection_id == collection_id, Document.deleted_at.is_(None))
    )
    if n and int(n) > 0:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "koleksiyonda belgeler var; önce belgeleri silin",
        )
    db.delete(row)
    await db.commit()
