from __future__ import annotations

import asyncio

from sentence_transformers import SentenceTransformer

from app.services.embedding import encode_chunks, load_model

_lock = asyncio.Lock()
_model: SentenceTransformer | None = None
_model_id: str | None = None


async def get_sentence_model(model_id: str) -> SentenceTransformer:
    global _model, _model_id
    async with _lock:
        if _model is None or _model_id != model_id:
            _model = await asyncio.to_thread(load_model, model_id)
            _model_id = model_id
    return _model


async def embed_query_text(model_id: str, text: str) -> list[float]:
    model = await get_sentence_model(model_id)
    arr = await asyncio.to_thread(encode_chunks, model, [text])
    return arr[0].tolist()
