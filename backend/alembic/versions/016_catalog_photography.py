"""Swap catalog SVG placeholders for real photography URLs

Revision ID: 016_catalog_photography
Revises: 015_chat_rate_limit
Create Date: 2026-08-03

Why: R6 — product-grade visuals need real trek/gear photos, not SVG
illustrations. Paths stay under /catalog so Next can serve them statically.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

from services.catalog_media import CATEGORY_IMAGES, CREDIT, TREK_IMAGES

revision: str = "016_catalog_photography"
down_revision: Union[str, Sequence[str], None] = "015_chat_rate_limit"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _tables() -> set[str]:
    return set(inspect(op.get_bind()).get_table_names())


def _columns(table: str) -> set[str]:
    return {c["name"] for c in inspect(op.get_bind()).get_columns(table)}


def upgrade() -> None:
    conn = op.get_bind()

    if "treks" in _tables() and "image_url" in _columns("treks"):
        for name, url in TREK_IMAGES.items():
            conn.execute(
                sa.text(
                    "UPDATE treks SET image_url = :url, image_credit = :credit WHERE trek_name = :name"
                ),
                {"url": url, "credit": CREDIT, "name": name},
            )

    if "gear" in _tables():
        for category, url in CATEGORY_IMAGES.items():
            conn.execute(
                sa.text("UPDATE gear SET photo_url = :url WHERE category = :category"),
                {"url": url, "category": category},
            )


def downgrade() -> None:
    """Restore SVG placeholder paths (files remain in frontend/public)."""
    conn = op.get_bind()
    svg_credit = "TrekPal catalog illustration"

    trek_svgs = {
        "Everest Base Camp": "/catalog/treks/everest-base-camp.svg",
        "Annapurna Circuit": "/catalog/treks/annapurna-circuit.svg",
        "Langtang Valley": "/catalog/treks/langtang-valley.svg",
        "Poon Hill": "/catalog/treks/poon-hill.svg",
        "Manaslu Circuit": "/catalog/treks/manaslu-circuit.svg",
    }
    gear_svgs = {
        "Footwear": "/catalog/gear/footwear.svg",
        "Clothing": "/catalog/gear/clothing.svg",
        "Accessories": "/catalog/gear/accessories.svg",
        "Camping": "/catalog/gear/camping.svg",
        "Hydration": "/catalog/gear/hydration.svg",
        "Safety": "/catalog/gear/safety.svg",
    }

    if "treks" in _tables() and "image_url" in _columns("treks"):
        for name, url in trek_svgs.items():
            conn.execute(
                sa.text(
                    "UPDATE treks SET image_url = :url, image_credit = :credit WHERE trek_name = :name"
                ),
                {"url": url, "credit": svg_credit, "name": name},
            )

    if "gear" in _tables():
        for category, url in gear_svgs.items():
            conn.execute(
                sa.text("UPDATE gear SET photo_url = :url WHERE category = :category"),
                {"url": url, "category": category},
            )
