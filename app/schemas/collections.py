from __future__ import annotations

import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.db.models import Collection as CollectionRow

ChunkingStrategy = Literal["fixed", "semantic"]


class CollectionOut(BaseModel):
    model_config = ConfigDict(ser_json_by_alias=True, populate_by_name=True)

    id: str
    name: str
    description: str | None = None
    document_count: int = Field(serialization_alias="documentCount")
    embedding_model: str = Field(serialization_alias="embeddingModel")
    chunk_size: int = Field(serialization_alias="chunkSize")
    overlap: int
    chunking_strategy: ChunkingStrategy = Field(serialization_alias="chunkingStrategy")
    top_k: int = Field(serialization_alias="topK")
    threshold: float
    hybrid_search: bool = Field(serialization_alias="hybridSearch")
    reranker: bool
    created_at: str = Field(serialization_alias="createdAt")


class CollectionCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    description: str | None = None
    embedding_model: str | None = Field(default="BAAI/bge-m3", alias="embeddingModel")
    chunk_size: int | None = Field(default=768, alias="chunkSize")
    overlap: int | None = None
    chunking_strategy: ChunkingStrategy | None = Field(default="fixed", alias="chunkingStrategy")
    top_k: int | None = Field(default=8, alias="topK")
    threshold: float | None = None
    hybrid_search: bool | None = Field(default=False, alias="hybridSearch")
    reranker: bool | None = None


class CollectionPatch(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str | None = None
    description: str | None = None
    embedding_model: str | None = Field(default=None, alias="embeddingModel")
    chunk_size: int | None = Field(default=None, alias="chunkSize")
    overlap: int | None = None
    chunking_strategy: ChunkingStrategy | None = Field(default=None, alias="chunkingStrategy")
    top_k: int | None = Field(default=None, alias="topK")
    threshold: float | None = None
    hybrid_search: bool | None = Field(default=None, alias="hybridSearch")
    reranker: bool | None = None


def collection_to_out(row: CollectionRow, document_count: int) -> CollectionOut:
    st = row.chunking_strategy if row.chunking_strategy in ("fixed", "semantic") else "fixed"
    return CollectionOut(
        id=str(row.id),
        name=row.name,
        description=row.description,
        document_count=document_count,
        embedding_model=row.embedding_model,
        chunk_size=row.chunk_size,
        overlap=row.overlap,
        chunking_strategy=st,  # type: ignore[arg-type]
        top_k=row.top_k,
        threshold=row.threshold,
        hybrid_search=row.hybrid_search,
        reranker=row.reranker,
        created_at=row.created_at.isoformat() if row.created_at else "",
    )


def apply_patch(row: CollectionRow, patch: CollectionPatch) -> None:
    for k, v in patch.model_dump(exclude_unset=True).items():
        setattr(row, k, v)


def create_row(data: CollectionCreate, cid: uuid.UUID | None = None) -> CollectionRow:
    return CollectionRow(
        id=cid or uuid.uuid4(),
        name=data.name,
        description=data.description,
        embedding_model=data.embedding_model or "BAAI/bge-m3",
        chunk_size=data.chunk_size if data.chunk_size is not None else 768,
        overlap=data.overlap if data.overlap is not None else 96,
        chunking_strategy=(data.chunking_strategy or "fixed"),
        top_k=data.top_k if data.top_k is not None else 8,
        threshold=data.threshold if data.threshold is not None else 0.7,
        hybrid_search=data.hybrid_search if data.hybrid_search is not None else False,
        reranker=data.reranker if data.reranker is not None else False,
    )
