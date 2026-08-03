"""Enrich trek catalog copy for trail-guide UX

Revision ID: 012_trek_catalog_content
Revises: 011_catalog_media
Create Date: 2026-08-03

Why: Treks page was altitude+duration only. Region, summary, seasons, and
highlights make the catalog feel like a real Nepal trail guide.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "012_trek_catalog_content"
down_revision: Union[str, Sequence[str], None] = "011_catalog_media"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TREK_CONTENT = {
    "Everest Base Camp": {
        "region": "Khumbu",
        "summary": (
            "Nepal's classic high trail to the foot of Everest. Gradual ascent from Lukla with "
            "teahouse lodges, Sherpa villages, and big mountain views — demanding but well supported."
        ),
        "best_seasons": "Spring · Autumn",
        "highlights": "Namche rest days · Tengboche monastery · Kala Patthar sunrise",
    },
    "Annapurna Circuit": {
        "region": "Annapurna",
        "summary": (
            "A long loop around the Annapurna massif through rice terraces, pine forest, and "
            "high desert. Crosses Thorong La — one of the world's famous trek passes."
        ),
        "best_seasons": "Spring · Autumn",
        "highlights": "Manang acclimatization · Thorong La · Changing climates in one trek",
    },
    "Langtang Valley": {
        "region": "Langtang",
        "summary": (
            "A quieter valley north of Kathmandu with Tamang culture, glaciers, and close "
            "mountain walls. Shorter than EBC but still serious altitude once you climb."
        ),
        "best_seasons": "Spring · Autumn",
        "highlights": "Kyanjin Gompa · Cheese factory stop · Closer access from Kathmandu",
    },
    "Poon Hill": {
        "region": "Annapurna",
        "summary": (
            "A short foothills trek famous for sunrise over Annapurna and Dhaulagiri. Ideal "
            "first Himalayan trek — lower altitude, clear lodges, big reward for few days."
        ),
        "best_seasons": "Autumn · Winter · Spring",
        "highlights": "Ghorepani lodges · Poon Hill viewpoint · Family-friendly duration",
    },
    "Manaslu Circuit": {
        "region": "Manaslu",
        "summary": (
            "A remote restricted-area circuit around the world's eighth-highest peak. Fewer "
            "crowds than Annapurna, wilder villages, and a serious Larkya La crossing."
        ),
        "best_seasons": "Spring · Autumn",
        "highlights": "Restricted permits · Tibetan-influenced villages · Larkya La pass",
    },
}

# Light polish for a few gear blurbs shown on the catalog page.
GEAR_COPY = {
    "hiking-boots": (
        "Waterproof, broken-in boots with ankle support. The item most trekkers regret buying new on day one."
    ),
    "down-jacket": (
        "Warm insulated layer for cold teahouse evenings and early starts above 4,000 m. Easy to rent in Thamel."
    ),
    "sleeping-bag-10c": (
        "Comfort around −10°C covers most teahouse nights on EBC/Annapurna. Lodges provide blankets, but a bag is safer."
    ),
    "trekking-poles": (
        "Save knees on long descents and add stability on snow or loose rock. Collapsible poles pack easily."
    ),
    "water-purification": (
        "Tablets or a filter so you can refill from lodges and streams instead of buying plastic bottles daily."
    ),
}


def _tables() -> set[str]:
    return set(inspect(op.get_bind()).get_table_names())


def _columns(table: str) -> set[str]:
    return {c["name"] for c in inspect(op.get_bind()).get_columns(table)}


def upgrade() -> None:
    if "treks" not in _tables():
        return

    cols = _columns("treks")
    if "region" not in cols:
        op.add_column("treks", sa.Column("region", sa.String(length=80), nullable=True))
    if "summary" not in cols:
        op.add_column("treks", sa.Column("summary", sa.String(length=500), nullable=True))
    if "best_seasons" not in cols:
        op.add_column("treks", sa.Column("best_seasons", sa.String(length=120), nullable=True))
    if "highlights" not in cols:
        op.add_column("treks", sa.Column("highlights", sa.String(length=300), nullable=True))

    conn = op.get_bind()
    for name, data in TREK_CONTENT.items():
        conn.execute(
            sa.text(
                """
                UPDATE treks
                SET region = :region,
                    summary = :summary,
                    best_seasons = :best_seasons,
                    highlights = :highlights
                WHERE trek_name = :name
                """
            ),
            {"name": name, **data},
        )

    if "gear" in _tables():
        for slug, description in GEAR_COPY.items():
            conn.execute(
                sa.text("UPDATE gear SET description = :description WHERE slug = :slug"),
                {"slug": slug, "description": description},
            )


def downgrade() -> None:
    if "treks" not in _tables():
        return
    cols = _columns("treks")
    for col in ("highlights", "best_seasons", "summary", "region"):
        if col in cols:
            op.drop_column("treks", col)
