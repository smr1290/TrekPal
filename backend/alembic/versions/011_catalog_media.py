"""Add trek images and gear catalog photo URLs

Revision ID: 011_catalog_media
Revises: 010_map_content_curation
Create Date: 2026-08-03

Why: M9 — Treks and gear cards need real visual media so the catalog
feels like a product, not a text database dump.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

from services.catalog_media import CATEGORY_IMAGES, CREDIT, TREK_IMAGES

revision: str = "011_catalog_media"
down_revision: Union[str, Sequence[str], None] = "010_map_content_curation"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _tables() -> set[str]:
    return set(inspect(op.get_bind()).get_table_names())


def _columns(table: str) -> set[str]:
    return {c["name"] for c in inspect(op.get_bind()).get_columns(table)}


def upgrade() -> None:
    if "treks" in _tables():
        cols = _columns("treks")
        if "image_url" not in cols:
            op.add_column("treks", sa.Column("image_url", sa.Text(), nullable=True))
        if "image_credit" not in cols:
            op.add_column("treks", sa.Column("image_credit", sa.String(length=200), nullable=True))

        conn = op.get_bind()
        for name, url in TREK_IMAGES.items():
            conn.execute(
                sa.text(
                    "UPDATE treks SET image_url = :url, image_credit = :credit WHERE trek_name = :name"
                ),
                {"url": url, "credit": CREDIT, "name": name},
            )

    if "gear" in _tables():
        conn = op.get_bind()
        conn.execute(
            sa.text(
                "UPDATE gear SET slug = 'rain-poncho' "
                "WHERE gear_name = 'Rain Poncho' AND (slug IS NULL OR slug = '')"
            )
        )
        for category, url in CATEGORY_IMAGES.items():
            conn.execute(
                sa.text(
                    "UPDATE gear SET photo_url = :url "
                    "WHERE category = :category AND (photo_url IS NULL OR photo_url = '')"
                ),
                {"url": url, "category": category},
            )


def downgrade() -> None:
    if "treks" in _tables():
        cols = _columns("treks")
        if "image_credit" in cols:
            op.drop_column("treks", "image_credit")
        if "image_url" in cols:
            op.drop_column("treks", "image_url")
