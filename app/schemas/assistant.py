from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class AssistantHistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=32000)


class AssistantChatIn(BaseModel):
    message: str = Field(..., min_length=1, max_length=16000)
    history: list[AssistantHistoryMessage] = Field(default_factory=list, max_length=24)
    ollama_model: str | None = None
    system_prompt: str | None = Field(default=None, max_length=16000)


class AssistantChatOut(BaseModel):
    reply: str


class AssistantPromptDefaultOut(BaseModel):
    system_prompt: str
