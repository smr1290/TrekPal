"""Postgres-backed chat rate limiting (Phase 2 / R10)

Revision ID: 015_chat_rate_limit
Revises: 014_heuristic_versioning
Create Date: 2026-08-03
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "015_chat_rate_limit"
down_revision: Union[str, Sequence[str], None] = "014_heuristic_versioning"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "chat_rate_limits",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("window_start", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("count", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "window_start"),
    )


def downgrade() -> None:
    op.drop_table("chat_rate_limits")
