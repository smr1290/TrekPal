"""Expand Nepal trek catalog beyond the original five demos

Revision ID: 017_nepal_trek_catalog
Revises: 016_catalog_photography
Create Date: 2026-08-04

Why: Users expect the Treks page to browse major Nepal routes, not only
the five seed treks. Insert/update curated catalog rows; keep freeform
destinations elsewhere for non-catalog planning.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

from services.nepal_trek_catalog import NEPAL_TREK_CATALOG, catalog_trek_names

revision: str = "017_nepal_trek_catalog"
down_revision: Union[str, Sequence[str], None] = "016_catalog_photography"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Keep the original five on downgrade; remove only rows this expansion added.
_ORIGINAL_FIVE = {
    "Everest Base Camp",
    "Annapurna Circuit",
    "Langtang Valley",
    "Poon Hill",
    "Manaslu Circuit",
}


def _tables() -> set[str]:
    return set(inspect(op.get_bind()).get_table_names())


def upgrade() -> None:
    if "treks" not in _tables():
        return

    conn = op.get_bind()
    for trek in NEPAL_TREK_CATALOG:
        existing = conn.execute(
            sa.text("SELECT id FROM treks WHERE trek_name = :name"),
            {"name": trek["trek_name"]},
        ).fetchone()

        params = {
            "name": trek["trek_name"],
            "max_altitude": trek["max_altitude"],
            "typical_duration": trek["typical_duration"],
            "difficulty": trek["difficulty"],
            "region": trek["region"],
            "summary": trek["summary"],
            "best_seasons": trek["best_seasons"],
            "highlights": trek["highlights"],
            "image_url": trek["image_url"],
            "image_credit": trek["image_credit"],
        }

        if existing:
            conn.execute(
                sa.text(
                    """
                    UPDATE treks
                    SET max_altitude = :max_altitude,
                        typical_duration = :typical_duration,
                        difficulty = :difficulty,
                        region = :region,
                        summary = :summary,
                        best_seasons = :best_seasons,
                        highlights = :highlights,
                        image_url = :image_url,
                        image_credit = :image_credit
                    WHERE trek_name = :name
                    """
                ),
                params,
            )
        else:
            conn.execute(
                sa.text(
                    """
                    INSERT INTO treks (
                        trek_name, max_altitude, typical_duration, difficulty,
                        region, summary, best_seasons, highlights,
                        image_url, image_credit
                    ) VALUES (
                        :name, :max_altitude, :typical_duration, :difficulty,
                        :region, :summary, :best_seasons, :highlights,
                        :image_url, :image_credit
                    )
                    """
                ),
                params,
            )


def downgrade() -> None:
    if "treks" not in _tables():
        return

    conn = op.get_bind()
    to_remove = catalog_trek_names() - _ORIGINAL_FIVE
    for name in sorted(to_remove):
        conn.execute(sa.text("DELETE FROM treks WHERE trek_name = :name"), {"name": name})
