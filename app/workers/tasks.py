from __future__ import annotations

import asyncio
import logging
import uuid

from sentence_transformers import SentenceTransformer

from app.config import get_settings
from app.db.session import AsyncSessionLocal
from app.services.embedding import load_model
from app.services.ingestion import IngestionService

logger = logging.getLogger(__name__)


async def startup(ctx: dict) -> None:
    settings = get_settings()
    ctx["model"] = await asyncio.to_thread(load_model, settings.embedding_model)


async def shutdown(ctx: dict) -> None:
    ctx.pop("model", None)


async def ingest_document(ctx: dict, document_id: str) -> None:
    uid = uuid.UUID(document_id)
    model: SentenceTransformer = ctx["model"]
    async with AsyncSessionLocal() as session:
        svc = IngestionService(session, model)
        await svc.process_document(uid)
