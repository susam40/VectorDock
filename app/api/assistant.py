from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.schemas.assistant import AssistantChatIn, AssistantChatOut, AssistantPromptDefaultOut
from app.services.assistant_prompt import DEFAULT_VECTOR_DOCK_ASSISTANT_SYSTEM
from app.services.ollama_client import ollama_chat

router = APIRouter()


@router.get("/prompt-default", response_model=AssistantPromptDefaultOut)
async def assistant_prompt_default() -> AssistantPromptDefaultOut:
    return AssistantPromptDefaultOut(system_prompt=DEFAULT_VECTOR_DOCK_ASSISTANT_SYSTEM)


@router.post("/chat", response_model=AssistantChatOut)
async def assistant_chat(body: AssistantChatIn) -> AssistantChatOut:
    settings = get_settings()
    model = (body.ollama_model or "").strip() or settings.ollama_chat_model
    custom = (body.system_prompt or "").strip()
    system = custom if custom else DEFAULT_VECTOR_DOCK_ASSISTANT_SYSTEM
    messages: list[dict[str, str]] = [{"role": "system", "content": system}]
    for m in body.history[-20:]:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": body.message.strip()})
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
        raise HTTPException(status_code=502, detail=f"Ollama HTTP hatası: {detail}") from e
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Ollama'ya bağlanılamadı ({settings.ollama_base_url}): {e}",
        ) from e
    text = (content or "").strip()
    if not text:
        raise HTTPException(status_code=502, detail="Model boş yanıt döndü.")
    return AssistantChatOut(reply=text)
