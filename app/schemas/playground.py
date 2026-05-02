from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

StepStatus = Literal["success", "skipped", "error"]


class PlaygroundQueryBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    query: str
    collection_id: str = Field(alias="collectionId")
    search_type: Literal["semantic", "hybrid", "bm25"] = Field(alias="searchType")
    top_k: int = Field(alias="topK")
    threshold: float
    ollama_model: str | None = Field(default=None, alias="ollamaModel")
    system_prompt: str | None = Field(default=None, alias="systemPrompt")
    user_prompt_with_context: str | None = Field(default=None, alias="userPromptWithContext")
    user_prompt_no_context: str | None = Field(default=None, alias="userPromptNoContext")


class PipelineStepOut(BaseModel):
    model_config = ConfigDict(ser_json_by_alias=True, populate_by_name=True)

    id: str
    name: str
    status: StepStatus
    latency_ms: int = Field(serialization_alias="latencyMs")
    input: str | None = None
    output: str | None = None


class RetrievedChunkOut(BaseModel):
    model_config = ConfigDict(ser_json_by_alias=True, populate_by_name=True)

    id: str
    text: str
    score: float
    rerank_score: float | None = Field(default=None, serialization_alias="rerankScore")
    document_name: str = Field(serialization_alias="documentName")


class LatencyBreakdownOut(BaseModel):
    model_config = ConfigDict(ser_json_by_alias=True, populate_by_name=True)

    embedding: int
    retrieval: int
    reranking: int
    llm: int
    total: int


class TokensOut(BaseModel):
    model_config = ConfigDict(ser_json_by_alias=True, populate_by_name=True)

    input: int
    output: int
    total: int


class PlaygroundResponseOut(BaseModel):
    model_config = ConfigDict(ser_json_by_alias=True, populate_by_name=True)

    raw_query: str = Field(serialization_alias="rawQuery")
    rewritten_query: str = Field(serialization_alias="rewrittenQuery")
    pipeline: list[PipelineStepOut]
    chunks: list[RetrievedChunkOut]
    final_prompt: str = Field(serialization_alias="finalPrompt")
    llm_model: str = Field(serialization_alias="llmModel")
    answer: str
    tokens: TokensOut
    latency_breakdown: LatencyBreakdownOut = Field(serialization_alias="latencyBreakdown")


def stub_playground_response(body: PlaygroundQueryBody) -> PlaygroundResponseOut:
    msg = "Playground sorgusu henüz uygulanmadı (vektör arama + LLM)."
    step = PipelineStepOut(
        id="stub",
        name="placeholder",
        status="skipped",
        latency_ms=0,
        output=msg,
    )
    return PlaygroundResponseOut(
        raw_query=body.query,
        rewritten_query=body.query,
        pipeline=[step],
        chunks=[],
        final_prompt="",
        llm_model="—",
        answer=msg,
        tokens=TokensOut(input=0, output=0, total=0),
        latency_breakdown=LatencyBreakdownOut(
            embedding=0,
            retrieval=0,
            reranking=0,
            llm=0,
            total=0,
        ),
    )
