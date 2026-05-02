from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.session import get_db
from app.schemas.playground import PlaygroundQueryBody, PlaygroundResponseOut
from app.services.ollama_client import ollama_list_model_names
from app.services.playground_rag import run_playground_rag

router = APIRouter()


@router.get("/ollama-models")
async def list_ollama_models() -> dict:
    settings = get_settings()
    try:
        names = await ollama_list_model_names(
            settings.ollama_base_url,
            api_key=settings.ollama_api_key,
        )
        return {"models": names}
    except (httpx.HTTPError, OSError, KeyError, TypeError, ValueError):
        return {"models": [settings.ollama_chat_model], "fallback": True}


@router.post("/query", response_model=PlaygroundResponseOut, response_model_by_alias=True)
async def playground_query(
    body: PlaygroundQueryBody,
    db: AsyncSession = Depends(get_db),
) -> PlaygroundResponseOut:
    settings = get_settings()
    model = (body.ollama_model or "").strip() or settings.ollama_chat_model
    try:
        return await run_playground_rag(db, settings, body, ollama_model=model)
    except httpx.HTTPStatusError as e:
        detail = (e.response.text or str(e))[:800]
        raise HTTPException(status_code=502, detail=f"Ollama HTTP hatası: {detail}") from e
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Ollama'ya bağlanılamadı ({settings.ollama_base_url}): {e}",
        ) from e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
