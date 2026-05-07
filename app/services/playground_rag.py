from __future__ import annotations

import time
import uuid

from sqlalchemy import cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.types import Float

from app.config import Settings
from app.db.models import Document, DocumentChunk
from app.schemas.playground import (
    LatencyBreakdownOut,
    PipelineStepOut,
    PlaygroundQueryBody,
    PlaygroundResponseOut,
    RetrievedChunkOut,
    TokensOut,
)
from app.services.embedding_runtime import embed_query_text
from app.services.ollama_client import ollama_chat

DEFAULT_SYSTEM_PROMPT = (
    "Kullanıcının sorusunu yalnızca verilen bağlam parçalarına dayanarak yanıtla. "
    "Bağlamda yoksa bunu açıkça söyle; uydurma."
)
DEFAULT_USER_PROMPT_WITH_CONTEXT = "Bağlam:\n{context}\n\nSoru: {question}"
DEFAULT_USER_PROMPT_NO_CONTEXT = (
    "Veritabanında bu soruyla ilgili anlamsal olarak yakın belge parçası bulunamadı.\n\n"
    "Soru: {question}\n\nGenel bilginle kısa yanıt ver ve kaynak bulunmadığını belirt."
)


def _estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)


def _resolve_prompt(value: str | None, default: str) -> str:
    if value is None:
        return default
    s = value.strip()
    return s if s else default


def _apply_placeholders(template: str, *, context: str, question: str) -> str:
    return template.replace("{context}", context).replace("{question}", question)


def _build_messages(
    context_chunks: list[RetrievedChunkOut],
    question: str,
    *,
    system_prompt: str | None = None,
    user_prompt_with_context: str | None = None,
    user_prompt_no_context: str | None = None,
) -> tuple[list[dict[str, str]], str]:
    system = _resolve_prompt(system_prompt, DEFAULT_SYSTEM_PROMPT)
    tpl_with = _resolve_prompt(user_prompt_with_context, DEFAULT_USER_PROMPT_WITH_CONTEXT)
    tpl_no = _resolve_prompt(user_prompt_no_context, DEFAULT_USER_PROMPT_NO_CONTEXT)
    if context_chunks:
        ctx_block = "\n\n".join(
            f"[{i} | {ch.document_name}]\n{ch.text}"
            for i, ch in enumerate(context_chunks, 1)
        )
        user = _apply_placeholders(tpl_with, context=ctx_block, question=question)
    else:
        user = _apply_placeholders(tpl_no, context="", question=question)
    messages = [{"role": "system", "content": system}, {"role": "user", "content": user}]
    display = f"## Sistem\n{system}\n\n## Kullanıcı\n{user}"
    return messages, display


async def _semantic_retrieve(
    session: AsyncSession,
    collection_id: uuid.UUID,
    query_vec: list[float],
    top_k: int,
    similarity_threshold: float,
) -> list[RetrievedChunkOut]:
    max_dist = 1.0 - similarity_threshold
    dist_expr = DocumentChunk.embedding.cosine_distance(query_vec)
    stmt = (
        select(DocumentChunk.id, DocumentChunk.content, Document.filename, dist_expr.label("cos_dist"))
        .join(Document, DocumentChunk.document_id == Document.id)
        .where(
            Document.collection_id == collection_id,
            Document.deleted_at.is_(None),
            Document.status == "ready",
            dist_expr <= max_dist,
        )
        .order_by(dist_expr)
        .limit(top_k)
    )
    result = await session.execute(stmt)
    return [
        RetrievedChunkOut(
            id=str(row.id),
            text=row.content,
            score=1.0 - float(row.cos_dist),
            rerank_score=None,
            document_name=row.filename,
        )
        for row in result.all()
    ]


async def _bm25_retrieve(
    session: AsyncSession,
    collection_id: uuid.UUID,
    query_text: str,
    top_k: int,
) -> list[RetrievedChunkOut]:
    ts_query = func.websearch_to_tsquery("simple", query_text)
    rank_expr = func.ts_rank_cd(func.to_tsvector("simple", DocumentChunk.content), ts_query)
    stmt = (
        select(
            DocumentChunk.id,
            DocumentChunk.content,
            Document.filename,
            cast(rank_expr, Float).label("bm25_score"),
        )
        .join(Document, DocumentChunk.document_id == Document.id)
        .where(
            Document.collection_id == collection_id,
            Document.deleted_at.is_(None),
            Document.status == "ready",
            rank_expr > 0,
        )
        .order_by(rank_expr.desc())
        .limit(top_k)
    )
    result = await session.execute(stmt)
    return [
        RetrievedChunkOut(
            id=str(row.id),
            text=row.content,
            score=float(row.bm25_score),
            rerank_score=None,
            document_name=row.filename,
        )
        for row in result.all()
    ]


def _rrf_merge(
    semantic_chunks: list[RetrievedChunkOut],
    bm25_chunks: list[RetrievedChunkOut],
    top_k: int,
) -> list[RetrievedChunkOut]:
    # Reciprocal Rank Fusion; stable and score-scale independent.
    rrf_k = 60.0
    merged: dict[str, RetrievedChunkOut] = {}
    rrf_score_by_id: dict[str, float] = {}

    for rank, chunk in enumerate(semantic_chunks, start=1):
        rrf_score_by_id[chunk.id] = rrf_score_by_id.get(chunk.id, 0.0) + (1.0 / (rrf_k + rank))
        if chunk.id not in merged:
            merged[chunk.id] = chunk

    for rank, chunk in enumerate(bm25_chunks, start=1):
        rrf_score_by_id[chunk.id] = rrf_score_by_id.get(chunk.id, 0.0) + (1.0 / (rrf_k + rank))
        if chunk.id not in merged:
            merged[chunk.id] = chunk

    ordered_ids = sorted(rrf_score_by_id.keys(), key=lambda chunk_id: rrf_score_by_id[chunk_id], reverse=True)
    return [
        RetrievedChunkOut(
            id=merged[chunk_id].id,
            text=merged[chunk_id].text,
            score=rrf_score_by_id[chunk_id],
            rerank_score=None,
            document_name=merged[chunk_id].document_name,
        )
        for chunk_id in ordered_ids[:top_k]
    ]


async def run_playground_rag(
    session: AsyncSession,
    settings: Settings,
    body: PlaygroundQueryBody,
    *,
    ollama_model: str,
) -> PlaygroundResponseOut:
    t_total0 = time.perf_counter()
    pipeline: list[PipelineStepOut] = []
    col_id = uuid.UUID(body.collection_id)

    qvec: list[float] | None = None
    embed_ms = 0
    if body.search_type != "bm25":
        t0 = time.perf_counter()
        try:
            qvec = await embed_query_text(settings.embedding_model, body.query)
        except Exception as e:  # noqa: BLE001
            embed_ms = int((time.perf_counter() - t0) * 1000)
            pipeline.append(
                PipelineStepOut(
                    id="embed",
                    name="Sorgu gömme",
                    status="error",
                    latency_ms=embed_ms,
                    output=str(e),
                )
            )
            raise
        pipeline.append(
            PipelineStepOut(
                id="embed",
                name="Sorgu gömme",
                status="success",
                latency_ms=embed_ms,
                input=body.query[:500],
                output=f"dim={len(qvec)}",
            )
        )
    else:
        pipeline.append(
            PipelineStepOut(
                id="embed",
                name="Sorgu gömme",
                status="skipped",
                latency_ms=0,
                output="BM25 modunda embedding kullanılmaz",
            )
        )

    t0 = time.perf_counter()
    if body.search_type == "semantic":
        chunks = await _semantic_retrieve(session, col_id, qvec or [], body.top_k, body.threshold)
        note = f"{len(chunks)} parça (mod=anlamsal, eşik≥{body.threshold:.2f})"
    elif body.search_type == "bm25":
        chunks = await _bm25_retrieve(session, col_id, body.query, body.top_k)
        note = f"{len(chunks)} parça (mod=bm25)"
    else:
        semantic_chunks = await _semantic_retrieve(
            session,
            col_id,
            qvec or [],
            max(body.top_k * 2, body.top_k),
            body.threshold,
        )
        bm25_chunks = await _bm25_retrieve(
            session,
            col_id,
            body.query,
            max(body.top_k * 2, body.top_k),
        )
        chunks = _rrf_merge(semantic_chunks, bm25_chunks, body.top_k)
        note = (
            f"{len(chunks)} parça (mod=hibrit, semantik={len(semantic_chunks)}, "
            f"bm25={len(bm25_chunks)}, eşik≥{body.threshold:.2f})"
        )
    retr_ms = int((time.perf_counter() - t0) * 1000)
    pipeline.append(
        PipelineStepOut(
            id="retrieve",
            name="Geri getirme",
            status="success",
            latency_ms=retr_ms,
            input=body.query[:500],
            output=note,
        )
    )

    pipeline.append(
        PipelineStepOut(
            id="rerank",
            name="Yeniden sıralama",
            status="skipped",
            latency_ms=0,
            output="Henüz etkin değil",
        )
    )

    messages, final_prompt = _build_messages(
        chunks,
        body.query,
        system_prompt=body.system_prompt,
        user_prompt_with_context=body.user_prompt_with_context,
        user_prompt_no_context=body.user_prompt_no_context,
    )

    t0 = time.perf_counter()
    answer, ometa = await ollama_chat(
        settings.ollama_base_url,
        ollama_model,
        messages,
        timeout=settings.ollama_timeout_seconds,
        api_key=settings.ollama_api_key,
    )
    llm_ms = int((time.perf_counter() - t0) * 1000)
    pipeline.append(
        PipelineStepOut(
            id="llm",
            name=f"LLM ({ollama_model})",
            status="success",
            latency_ms=llm_ms,
            output=answer[:2000] + ("…" if len(answer) > 2000 else ""),
        )
    )

    in_tok = ometa.get("prompt_eval_count")
    out_tok = ometa.get("eval_count")
    if in_tok is None:
        in_tok = _estimate_tokens(final_prompt)
    if out_tok is None:
        out_tok = _estimate_tokens(answer)
    in_tok = int(in_tok)
    out_tok = int(out_tok)

    total_ms = int((time.perf_counter() - t_total0) * 1000)
    return PlaygroundResponseOut(
        raw_query=body.query,
        rewritten_query=body.query,
        pipeline=pipeline,
        chunks=chunks,
        final_prompt=final_prompt,
        answer=answer,
        llm_model=ollama_model,
        tokens=TokensOut(input=in_tok, output=out_tok, total=in_tok + out_tok),
        latency_breakdown=LatencyBreakdownOut(
            embedding=embed_ms,
            retrieval=retr_ms,
            reranking=0,
            llm=llm_ms,
            total=total_ms,
        ),
    )
