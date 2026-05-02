from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

LogType = Literal["ingestion", "query", "error", "system"]


class LogEntryOut(BaseModel):
    model_config = ConfigDict(ser_json_by_alias=True, populate_by_name=True)

    id: str
    type: LogType
    ts: str
    message: str
    payload: dict | None = None
    trace_id: str | None = Field(default=None, serialization_alias="traceId")
