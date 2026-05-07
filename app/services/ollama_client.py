from __future__ import annotations

from typing import Any

import httpx


def ollama_api_root(base_url: str) -> str:
    """OpenAI-uyumlu API kökü (örn: https://integrate.api.nvidia.com/v1)."""
    return base_url.strip().rstrip("/")


def _auth_headers(api_key: str | None) -> dict[str, str]:
    key = (api_key or "").strip()
    if not key:
        return {}
    return {"Authorization": f"Bearer {key}"}


async def ollama_chat(
    base_url: str,
    model: str,
    messages: list[dict[str, str]],
    *,
    timeout: float,
    api_key: str | None = None,
) -> tuple[str, dict[str, Any]]:
    url = ollama_api_root(base_url) + "/chat/completions"
    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "stream": False,
    }
    headers = _auth_headers(api_key)
    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(url, json=payload, headers=headers)
        r.raise_for_status()
        data = r.json()
    choices = data.get("choices") or []
    first = choices[0] if choices else {}
    content = ((first.get("message") or {}).get("content") or "") if isinstance(first, dict) else ""
    usage = data.get("usage") if isinstance(data, dict) else {}
    meta = {
        "prompt_eval_count": (usage or {}).get("prompt_tokens"),
        "eval_count": (usage or {}).get("completion_tokens"),
    }
    return content, meta


async def ollama_list_model_names(
    base_url: str,
    *,
    timeout: float = 5.0,
    api_key: str | None = None,
) -> list[str]:
    url = ollama_api_root(base_url) + "/models"
    headers = _auth_headers(api_key)
    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.get(url, headers=headers)
        r.raise_for_status()
        data = r.json()
    models = data.get("data") or []
    return [m["id"] for m in models if isinstance(m, dict) and m.get("id")]


async def ollama_reachable(
    base_url: str,
    *,
    timeout: float = 2.0,
    api_key: str | None = None,
) -> bool:
    url = ollama_api_root(base_url) + "/models"
    headers = _auth_headers(api_key)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.get(url, headers=headers)
            return r.is_success
    except (httpx.HTTPError, OSError):
        return False
