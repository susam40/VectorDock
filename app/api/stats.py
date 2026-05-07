from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
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
        llm_provider=f"OpenAI-compatible · {settings.ollama_chat_model}",
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
async def get_activity(db: AsyncSession = Depends(get_db)) -> list[ActivityPointOut]:
    today = date.today()
    start_day = today - timedelta(days=6)
    day_expr = func.date(Document.uploaded_at)
    rows = await db.execute(
        select(
            day_expr.label("day"),
            func.count(Document.id).label("uploads"),
            func.sum(case((Document.status == "failed", 1), else_=0)).label("errors"),
        )
        .where(
            Document.deleted_at.is_(None),
            day_expr >= start_day,
        )
        .group_by(day_expr)
    )
    by_day = {
        row.day.isoformat(): {
            "uploads": int(row.uploads or 0),
            "errors": int(row.errors or 0),
        }
        for row in rows.all()
    }

    out: list[ActivityPointOut] = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        iso = d.isoformat()
        day_data = by_day.get(iso, {"uploads": 0, "errors": 0})
        out.append(
            ActivityPointOut(
                date=iso,
                queries=0,
                uploads=day_data["uploads"],
                errors=day_data["errors"],
            )
        )
    return out
