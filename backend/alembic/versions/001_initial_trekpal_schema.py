"""Initial TrekPal schema

Revision ID: 001_initial_trekpal
Revises:
Create Date: 2026-07-26

Creates the current TrekPal tables:
- users
- treks
- gear
- user_trek_history
- trek_gear_recommendations

Safe on existing databases: skips tables that already exist
(from the previous create_all bootstrap).
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "001_initial_trekpal"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _tables() -> set[str]:
    bind = op.get_bind()
    return set(inspect(bind).get_table_names())


def upgrade() -> None:
    existing = _tables()

    if "users" not in existing:
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("full_name", sa.String(length=100), nullable=False),
            sa.Column("email", sa.String(length=150), nullable=False),
            sa.Column("password_hash", sa.Text(), nullable=False),
            sa.Column("experience_level", sa.String(length=20), nullable=True),
            sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=True),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email"),
        )
        op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    if "treks" not in existing:
        op.create_table(
            "treks",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("trek_name", sa.String(length=150), nullable=False),
            sa.Column("max_altitude", sa.Integer(), nullable=True),
            sa.Column("typical_duration", sa.Integer(), nullable=True),
            sa.Column("difficulty", sa.String(length=20), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_treks_id"), "treks", ["id"], unique=False)

    if "gear" not in existing:
        op.create_table(
            "gear",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("gear_name", sa.String(length=150), nullable=False),
            sa.Column("category", sa.String(length=50), nullable=True),
            sa.Column("photo_url", sa.Text(), nullable=True),
            sa.Column("description", sa.Text(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_gear_id"), "gear", ["id"], unique=False)

    # Refresh after possible creates above
    existing = _tables()

    if "user_trek_history" not in existing:
        op.create_table(
            "user_trek_history",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=True),
            sa.Column("trek_type", sa.String(length=50), nullable=True),
            sa.Column("experience_level", sa.String(length=20), nullable=True),
            sa.Column("input_altitude", sa.Integer(), nullable=True),
            sa.Column("season", sa.String(length=20), nullable=True),
            sa.Column("planned_duration", sa.Integer(), nullable=True),
            sa.Column("risk_level", sa.String(length=20), nullable=True),
            sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=True),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_user_trek_history_id"), "user_trek_history", ["id"], unique=False)

    existing = _tables()

    if "trek_gear_recommendations" not in existing:
        op.create_table(
            "trek_gear_recommendations",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("history_id", sa.Integer(), nullable=True),
            sa.Column("gear_id", sa.Integer(), nullable=True),
            sa.ForeignKeyConstraint(["gear_id"], ["gear.id"]),
            sa.ForeignKeyConstraint(["history_id"], ["user_trek_history.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            op.f("ix_trek_gear_recommendations_id"),
            "trek_gear_recommendations",
            ["id"],
            unique=False,
        )


def downgrade() -> None:
    existing = _tables()

    if "trek_gear_recommendations" in existing:
        op.drop_index(op.f("ix_trek_gear_recommendations_id"), table_name="trek_gear_recommendations")
        op.drop_table("trek_gear_recommendations")

    if "user_trek_history" in existing:
        op.drop_index(op.f("ix_user_trek_history_id"), table_name="user_trek_history")
        op.drop_table("user_trek_history")

    if "gear" in existing:
        op.drop_index(op.f("ix_gear_id"), table_name="gear")
        op.drop_table("gear")

    if "treks" in existing:
        op.drop_index(op.f("ix_treks_id"), table_name="treks")
        op.drop_table("treks")

    if "users" in existing:
        op.drop_index(op.f("ix_users_id"), table_name="users")
        op.drop_table("users")
