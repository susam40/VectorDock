"""collections table + documents.collection_id FK

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-02

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "collections",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("embedding_model", sa.String(length=128), server_default="BAAI/bge-m3", nullable=False),
        sa.Column("chunk_size", sa.Integer(), server_default="768", nullable=False),
        sa.Column("overlap", sa.Integer(), server_default="96", nullable=False),
        sa.Column("chunking_strategy", sa.String(length=16), server_default="fixed", nullable=False),
        sa.Column("top_k", sa.Integer(), server_default="8", nullable=False),
        sa.Column("threshold", sa.Float(), server_default="0.7", nullable=False),
        sa.Column("hybrid_search", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("reranker", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.execute(
        sa.text(
            """
            INSERT INTO collections (
                id, name, description, embedding_model, chunk_size, overlap,
                chunking_strategy, top_k, threshold, hybrid_search, reranker
            )
            SELECT DISTINCT
                d.collection_id,
                'Koleksiyon ' || LEFT(d.collection_id::text, 8),
                NULL,
                'BAAI/bge-m3',
                768,
                96,
                'fixed',
                8,
                0.7,
                false,
                false
            FROM documents d
            WHERE NOT EXISTS (SELECT 1 FROM collections c WHERE c.id = d.collection_id)
            """
        )
    )
    op.create_foreign_key(
        "fk_documents_collection_id_collections",
        "documents",
        "collections",
        ["collection_id"],
        ["id"],
        ondelete="RESTRICT",
    )


def downgrade() -> None:
    op.drop_constraint("fk_documents_collection_id_collections", "documents", type_="foreignkey")
    op.drop_table("collections")
