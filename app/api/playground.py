from __future__ import annotations

from fastapi import APIRouter

from app.schemas.playground import PlaygroundQueryBody, PlaygroundResponseOut, stub_playground_response

router = APIRouter()


@router.post("/query", response_model=PlaygroundResponseOut, response_model_by_alias=True)
async def playground_query(body: PlaygroundQueryBody) -> PlaygroundResponseOut:
    return stub_playground_response(body)
