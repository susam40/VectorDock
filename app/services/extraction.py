from __future__ import annotations

import re
from pathlib import Path
from typing import Any


def _strip_md_noise(text: str) -> str:
    text = re.sub(r"```[\s\S]*?```", " ", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    return text


def extract_text(path: Path, source_type: str) -> tuple[str, dict[str, Any]]:
    """Return plain text and document-level metadata."""
    suffix = path.suffix.lower()
    meta: dict[str, Any] = {"source": f"uploaded_{source_type}"}

    if suffix == ".pdf" or source_type == "pdf":
        import fitz  # pymupdf

        doc = fitz.open(path)
        try:
            parts: list[str] = []
            for i, page in enumerate(doc):
                t = page.get_text() or ""
                parts.append(t)
            meta["page_count"] = len(parts)
            return "\n\n".join(parts).strip(), meta
        finally:
            doc.close()

    if suffix == ".docx" or source_type == "docx":
        import docx

        d = docx.Document(path)
        paras = [p.text for p in d.paragraphs if p.text and p.text.strip()]
        return "\n\n".join(paras).strip(), meta

    if suffix in (".md", ".markdown"):
        raw = path.read_text(encoding="utf-8", errors="replace")
        return _strip_md_noise(raw).strip(), {**meta, "format": "markdown"}

    raw = path.read_text(encoding="utf-8", errors="replace")
    return raw.strip(), meta


def detect_source_type(filename: str) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return "pdf"
    if lower.endswith(".docx"):
        return "docx"
    if lower.endswith(".md") or lower.endswith(".markdown"):
        return "markdown"
    return "txt"
