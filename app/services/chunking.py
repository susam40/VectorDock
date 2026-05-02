from __future__ import annotations

from typing import Any

from langchain_text_splitters import RecursiveCharacterTextSplitter, TokenTextSplitter


def chunk_text(
    text: str,
    chunk_size_tokens: int = 512,
    chunk_overlap_tokens: int = 64,
    chunk_metadata: dict[str, Any] | None = None,
) -> list[tuple[str, dict[str, Any]]]:
    """Token-based chunks; falls back to character splitter if tiktoken encoding fails."""
    base_meta = dict(chunk_metadata or {})
    try:
        splitter = TokenTextSplitter(
            encoding_name="cl100k_base",
            chunk_size=chunk_size_tokens,
            chunk_overlap=chunk_overlap_tokens,
        )
        pieces = splitter.split_text(text)
    except Exception:
        approx_chars = max(4, chunk_size_tokens * 4)
        overlap_chars = max(1, chunk_overlap_tokens * 4)
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=approx_chars,
            chunk_overlap=overlap_chars,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        pieces = splitter.split_text(text)

    out: list[tuple[str, dict[str, Any]]] = []
    for i, p in enumerate(pieces):
        chunk_meta = {**base_meta, "chunk_index": i}
        out.append((p.strip(), chunk_meta))
    return [(t, m) for t, m in out if t]
