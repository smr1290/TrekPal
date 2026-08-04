"""Refresh trek catalog with accurate altitudes/durations and NTB coverage

Revision ID: 018_trek_catalog_accuracy
Revises: 017_nepal_trek_catalog
Create Date: 2026-08-04

Why: Expand/correct the Nepal trek catalog using published typical altitudes
and durations (NTB route names + agency comparison bands). Upsert all rows;
remove renamed obsolete titles from 017.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

from services.nepal_trek_catalog import NEPAL_TREK_CATALOG

revision: str = "018_trek_catalog_accuracy"
down_revision: Union[str, Sequence[str], None] = "017_nepal_trek_catalog"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Titles from 017 that were renamed or dropped in the accuracy refresh.
_OBSOLETE_NAMES = {
    "Tilicho Lake",
    "Renjo La Pass",
}

# Snapshot of names added by 017 (for partial downgrade of brand-new 018 rows).
_NAMES_AT_017 = {
    "Everest Base Camp",
    "Gokyo Lakes",
    "Everest Three Passes",
    "Everest Base Camp via Cho La",
    "Ama Dablam Base Camp",
    "Renjo La Pass",
    "Annapurna Circuit",
    "Annapurna Base Camp",
    "Poon Hill",
    "Mardi Himal",
    "Khopra Danda",
    "Mohare Danda",
    "Tilicho Lake",
    "Nar Phu Valley",
    "Upper Mustang",
    "Jomsom Muktinath",
    "Dhaulagiri Circuit",
    "Langtang Valley",
    "Gosainkunda Lake",
    "Langtang Gosainkunda Helambu",
    "Helambu Circuit",
    "Tamang Heritage Trail",
    "Ganja La Pass",
    "Manaslu Circuit",
    "Tsum Valley",
    "Manaslu Circuit with Tsum Valley",
    "Makalu Base Camp",
    "Kanchenjunga Base Camp",
    "Rolwaling Valley",
    "Upper Dolpo",
    "Lower Dolpo",
    "Rara Lake",
    "Khaptad National Park",
    "Api Base Camp",
    "Humla Limi Valley",
    "Panchase Trek",
    "Australian Camp Dhampus",
    "Nagarkot Chisapani",
    "Shivapuri Chisapani",
    "Royal Trek",
    "Sikles Trek",
    "Pikey Peak",
    "Dudh Kunda",
}


def _tables() -> set[str]:
    return set(inspect(op.get_bind()).get_table_names())


def _upsert_catalog(conn) -> None:
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


def upgrade() -> None:
    if "treks" not in _tables():
        return

    conn = op.get_bind()
    _upsert_catalog(conn)

    for name in sorted(_OBSOLETE_NAMES):
        conn.execute(sa.text("DELETE FROM treks WHERE trek_name = :name"), {"name": name})


def downgrade() -> None:
    """Remove rows that only exist after the 018 expansion (keep 017 set)."""
    if "treks" not in _tables():
        return

    conn = op.get_bind()
    current_names = {t["trek_name"] for t in NEPAL_TREK_CATALOG}
    only_in_018 = current_names - _NAMES_AT_017
    for name in sorted(only_in_018):
        conn.execute(sa.text("DELETE FROM treks WHERE trek_name = :name"), {"name": name})

    # Note: corrected altitudes on shared 017 names are not reverted (data-only
    # correction). Re-run 017 upsert logic is unnecessary for schema safety.
