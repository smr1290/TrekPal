"""Destination length check constraints (R2)

Revision ID: 013_destination_checks
Revises: 012_trek_catalog_content
Create Date: 2026-08-03

Why: Keep destinations freeform (non-catalog treks allowed) but enforce
max length at the DB so garbage strings cannot bypass the API forever.
"""

from typing import Sequence, Union

from alembic import op

revision: str = "013_destination_checks"
down_revision: Union[str, Sequence[str], None] = "012_trek_catalog_content"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Trim oversized legacy rows before adding checks (defensive).
    op.execute(
        """
        UPDATE user_trek_history
        SET destination = LEFT(destination, 150)
        WHERE destination IS NOT NULL AND char_length(destination) > 150
        """
    )
    op.execute(
        """
        UPDATE trip_plans
        SET destination = LEFT(destination, 150)
        WHERE char_length(destination) > 150
        """
    )
    op.create_check_constraint(
        "ck_user_trek_history_destination_len",
        "user_trek_history",
        "destination IS NULL OR char_length(destination) BETWEEN 2 AND 150",
    )
    op.create_check_constraint(
        "ck_trip_plans_destination_len",
        "trip_plans",
        "char_length(destination) BETWEEN 2 AND 150",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_trip_plans_destination_len", "trip_plans", type_="check"
    )
    op.drop_constraint(
        "ck_user_trek_history_destination_len",
        "user_trek_history",
        type_="check",
    )
