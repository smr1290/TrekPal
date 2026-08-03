"""Heuristic versioning + persisted risk factors (R4)

Revision ID: 014_heuristic_versioning
Revises: 013_destination_checks
Create Date: 2026-08-03

Why: Historical risk/gear rows must stay traceable when heuristic logic changes.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "014_heuristic_versioning"
down_revision: Union[str, Sequence[str], None] = "013_destination_checks"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user_trek_history",
        sa.Column("heuristic_version", sa.String(length=40), nullable=True),
    )
    op.add_column(
        "user_trek_history",
        sa.Column("risk_factors_json", sa.Text(), nullable=True),
    )
    op.add_column(
        "trip_plans",
        sa.Column("heuristic_version", sa.String(length=40), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("trip_plans", "heuristic_version")
    op.drop_column("user_trek_history", "risk_factors_json")
    op.drop_column("user_trek_history", "heuristic_version")
