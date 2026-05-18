from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.config import get_settings
from app.schemas.assistant import AssistantChatIn, AssistantChatOut, AssistantPromptDefaultOut
from app.services.assistant_prompt import DEFAULT_VECTOR_DOCK_ASSISTANT_SYSTEM
from app.services.ollama_client import ollama_chat, ollama_chat_stream

router = APIRouter()


def _assistant_messages(body: AssistantChatIn) -> tuple[str, list[dict[str, str]]]:
    settings = get_settings()
    model = (body.ollama_model or "").strip() or settings.ollama_chat_model
    custom = (body.system_prompt or "").strip()
    system = custom if custom else DEFAULT_VECTOR_DOCK_ASSISTANT_SYSTEM
    messages: list[dict[str, str]] = [{"role": "system", "content": system}]
    for m in body.history[-20:]:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": body.message.strip()})
    return model, messages


@router.get("/prompt-default", response_model=AssistantPromptDefaultOut)
async def assistant_prompt_default() -> AssistantPromptDefaultOut:
    return AssistantPromptDefaultOut(system_prompt=DEFAULT_VECTOR_DOCK_ASSISTANT_SYSTEM)


@router.post("/chat", response_model=AssistantChatOut)
async def assistant_chat(body: AssistantChatIn) -> AssistantChatOut:
    settings = get_settings()
    model, messages = _assistant_messages(body)
    try:
        content, _ = await ollama_chat(
            settings.ollama_base_url,
            model,
            messages,
            timeout=settings.ollama_timeout_seconds,
            api_key=settings.ollama_api_key,
        )
    except httpx.HTTPStatusError as e:
        detail = (e.response.text or str(e))[:800]
        raise HTTPException(status_code=502, detail=f"LLM HTTP hatası: {detail}") from e
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail=f"LLM servisine bağlanılamadı ({settings.ollama_base_url}): {e}",
        ) from e
    text = (content or "").strip()
    if not text:
        raise HTTPException(status_code=502, detail="Model boş yanıt döndü.")
    return AssistantChatOut(reply=text)


def _ndjson_line(payload: dict[str, object]) -> str:
    return json.dumps(payload, ensure_ascii=False) + "\n"


def _simulate_stream_chunks(text: str, *, size: int = 16) -> list[str]:
    return [text[i : i + size] for i in range(0, len(text), size)]


@router.post("/chat/stream")
async def assistant_chat_stream(body: AssistantChatIn) -> StreamingResponse:
    settings = get_settings()
    model, messages = _assistant_messages(body)

    async def event_stream() -> AsyncIterator[str]:
        had_content = False
        try:
            async for chunk in ollama_chat_stream(
                settings.ollama_base_url,
                model,
                messages,
                timeout=settings.ollama_timeout_seconds,
                api_key=settings.ollama_api_key,
            ):
                had_content = True
                yield _ndjson_line({"delta": chunk})
                await asyncio.sleep(0)
        except httpx.HTTPStatusError as e:
            detail = (e.response.text or str(e))[:800]
            yield _ndjson_line({"error": f"LLM HTTP hatası: {detail}"})
            return
        except httpx.RequestError as e:
            yield _ndjson_line(
                {
                    "error": (
                        f"LLM servisine bağlanılamadı ({settings.ollama_base_url}): {e}"
                    )
                }
            )
            return
        if not had_content:
            try:
                content, _ = await ollama_chat(
                    settings.ollama_base_url,
                    model,
                    messages,
                    timeout=settings.ollama_timeout_seconds,
                    api_key=settings.ollama_api_key,
                )
            except httpx.HTTPStatusError as e:
                detail = (e.response.text or str(e))[:800]
                yield _ndjson_line({"error": f"LLM HTTP hatası: {detail}"})
                return
            except httpx.RequestError as e:
                yield _ndjson_line(
                    {
                        "error": (
                            f"LLM servisine bağlanılamadı "
                            f"({settings.ollama_base_url}): {e}"
                        )
                    }
                )
                return
            text = (content or "").strip()
            if not text:
                yield _ndjson_line({"error": "Model boş yanıt döndü."})
                return
            for piece in _simulate_stream_chunks(text):
                yield _ndjson_line({"delta": piece})
                await asyncio.sleep(0.01)
        yield _ndjson_line({"done": True})

    return StreamingResponse(
        event_stream(),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
