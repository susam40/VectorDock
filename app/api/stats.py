from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models import Collection, Document, DocumentChunk
from app.db.session import get_db
from app.schemas.stats import ActivityPointOut, StatsHealth, StatsOverviewOut
from app.services.ollama_client import ollama_reachable

router = APIRouter()


@router.get("", response_model=StatsOverviewOut, response_model_by_alias=True)
async def get_stats(db: AsyncSession = Depends(get_db)) -> StatsOverviewOut:
    settings = get_settings()
    active_doc = Document.deleted_at.is_(None)
    total_docs = int(await db.scalar(select(func.count()).select_from(Document).where(active_doc)) or 0)
    indexed_chunks = int(
        await db.scalar(
            select(func.count())
            .select_from(DocumentChunk)
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(active_doc)
        )
        or 0
    )
    active_cols = int(await db.scalar(select(func.count()).select_from(Collection)) or 0)
    storage = int(
        await db.scalar(select(func.coalesce(func.sum(Document.size_bytes), 0)).where(active_doc)) or 0
    )
    ollama_ok = await ollama_reachable(
        settings.ollama_base_url,
        api_key=settings.ollama_api_key,
    )
    return StatsOverviewOut(
        total_documents=total_docs,
        indexed_chunks=indexed_chunks,
        active_collections=active_cols,
        embedding_model=settings.embedding_model,
        llm_provider=f"Ollama · {settings.ollama_chat_model}",
        avg_query_latency_ms=0,
        storage_usage_bytes=storage,
        queue_depth=0,
        active_jobs=0,
        health=StatsHealth(
            embedding="healthy",
            llm="healthy" if ollama_ok else "degraded",
            vector_db="healthy",
        ),
    )


@router.get("/activity", response_model=list[ActivityPointOut], response_model_by_alias=True)
async def get_activity() -> list[ActivityPointOut]:
    today = date.today()
    out: list[ActivityPointOut] = []
    for i in range(13, -1, -1):
        d = today - timedelta(days=i)
        out.append(ActivityPointOut(date=d.isoformat(), queries=0, uploads=0, errors=0))
    return out
