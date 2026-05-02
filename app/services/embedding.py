from __future__ import annotations

import numpy as np
from sentence_transformers import SentenceTransformer


def load_model(model_id: str) -> SentenceTransformer:
    return SentenceTransformer(model_id)


def encode_chunks(model: SentenceTransformer, chunks: list[str], batch_size: int = 32) -> np.ndarray:
    if not chunks:
        return np.zeros((0, model.get_sentence_embedding_dimension()), dtype=np.float32)
    return model.encode(
        chunks,
        batch_size=batch_size,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
