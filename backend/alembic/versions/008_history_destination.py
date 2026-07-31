"""Add destination to trek preparation history

Revision ID: 008_history_destination
Revises: 007_map_location_verified
Create Date: 2026-07-31
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "008_history_destination"
down_revision: Union[str, Sequence[str], None] = "007_map_location_verified"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user_trek_history",
        sa.Column("destination", sa.String(length=150), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("user_trek_history", "destination")
