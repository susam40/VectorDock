from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Health = Literal["healthy", "degraded", "down"]


class StatsHealth(BaseModel):
    model_config = ConfigDict(ser_json_by_alias=True, populate_by_name=True)

    embedding: Health
    llm: Health
    vector_db: Health = Field(serialization_alias="vectorDb")


class StatsOverviewOut(BaseModel):
    model_config = ConfigDict(ser_json_by_alias=True, populate_by_name=True)

    total_documents: int = Field(serialization_alias="totalDocuments")
    indexed_chunks: int = Field(serialization_alias="indexedChunks")
    active_collections: int = Field(serialization_alias="activeCollections")
    embedding_model: str = Field(serialization_alias="embeddingModel")
    llm_provider: str = Field(serialization_alias="llmProvider")
    avg_query_latency_ms: int = Field(serialization_alias="avgQueryLatencyMs")
    storage_usage_bytes: int = Field(serialization_alias="storageUsageBytes")
    queue_depth: int = Field(serialization_alias="queueDepth")
    active_jobs: int = Field(serialization_alias="activeJobs")
    health: StatsHealth


class ActivityPointOut(BaseModel):
    model_config = ConfigDict(ser_json_by_alias=True, populate_by_name=True)

    date: str
    queries: int
    uploads: int
    errors: int
