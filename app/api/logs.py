from __future__ import annotations

from fastapi import APIRouter

from app.schemas.logs import LogEntryOut

router = APIRouter()


@router.get("", response_model=list[LogEntryOut], response_model_by_alias=True)
async def list_logs() -> list[LogEntryOut]:
    return []
