"""Trip plans table for AI Trip Planner

Revision ID: 003_trip_plans
Revises: 002_knowledge_articles
Create Date: 2026-07-29
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "003_trip_plans"
down_revision: Union[str, Sequence[str], None] = "002_knowledge_articles"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _tables() -> set[str]:
    bind = op.get_bind()
    return set(inspect(bind).get_table_names())


def upgrade() -> None:
    if "trip_plans" in _tables():
        return

    op.create_table(
        "trip_plans",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("trek_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("destination", sa.String(length=150), nullable=False),
        sa.Column("season", sa.String(length=20), nullable=False),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("experience_level", sa.String(length=20), nullable=False),
        sa.Column("difficulty", sa.String(length=20), nullable=False),
        sa.Column("risk_level", sa.String(length=20), nullable=True),
        sa.Column("plan_json", sa.Text(), nullable=False),
        sa.Column("source", sa.String(length=20), nullable=False, server_default="ai"),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["trek_id"], ["treks.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_trip_plans_id"), "trip_plans", ["id"], unique=False)
    op.create_index(op.f("ix_trip_plans_user_id"), "trip_plans", ["user_id"], unique=False)


def downgrade() -> None:
    if "trip_plans" not in _tables():
        return
    op.drop_index(op.f("ix_trip_plans_user_id"), table_name="trip_plans")
    op.drop_index(op.f("ix_trip_plans_id"), table_name="trip_plans")
    op.drop_table("trip_plans")
