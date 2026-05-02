from __future__ import annotations

import asyncio
import logging
import uuid
from pathlib import Path

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from sentence_transformers import SentenceTransformer

from app.config import get_settings
from app.db.models import Document, DocumentChunk
from app.services.chunking import chunk_text
from app.services.embedding import encode_chunks
from app.services.extraction import detect_source_type, extract_text

logger = logging.getLogger(__name__)


class IngestionService:
    def __init__(self, session: AsyncSession, model: SentenceTransformer):
        self.session = session
        self.model = model

    async def process_document(self, document_id: uuid.UUID) -> None:
        settings = get_settings()
        doc = await self.session.get(Document, document_id)
        if not doc:
            logger.warning("ingestion: document %s not found", document_id)
            return

        path = Path(doc.storage_path)
        if not path.is_file():
            doc.status = "failed"
            doc.error_message = "stored file missing"
            await self.session.commit()
            return

        try:
            doc.status = "parsing"
            await self.session.commit()

            text, doc_meta = extract_text(path, doc.source_type or detect_source_type(doc.filename))
            if not text:
                doc.status = "failed"
                doc.error_message = "no extractable text"
                doc.chunk_count = 0
                await self.session.commit()
                return

            doc.status = "embedding"
            await self.session.commit()

            chunk_items = chunk_text(text, chunk_metadata=doc_meta)
            if not chunk_items:
                doc.status = "failed"
                doc.error_message = "chunking produced no segments"
                await self.session.commit()
                return

            texts = [c for c, _ in chunk_items]
            metas = [m for _, m in chunk_items]

            embeddings = await asyncio.to_thread(encode_chunks, self.model, texts)

            await self.session.execute(delete(DocumentChunk).where(DocumentChunk.document_id == doc.id))

            dim = settings.embedding_dimension
            for idx, (content, meta, row) in enumerate(zip(texts, metas, embeddings, strict=True)):
                vec = row.tolist() if hasattr(row, "tolist") else list(row)
                if len(vec) != dim:
                    raise ValueError(f"embedding dim {len(vec)} != expected {dim}")
                self.session.add(
                    DocumentChunk(
                        document_id=doc.id,
                        chunk_index=idx,
                        content=content,
                        embedding=vec,
                        chunk_metadata=meta,
                    )
                )

            doc.chunk_count = len(texts)
            doc.status = "ready"
            doc.error_message = None
            await self.session.commit()
        except Exception as e:  # noqa: BLE001
            logger.exception("ingestion failed for %s", document_id)
            await self.session.rollback()
            doc = await self.session.get(Document, document_id)
            if doc:
                doc.status = "failed"
                doc.error_message = str(e)[:2000]
                await self.session.commit()
