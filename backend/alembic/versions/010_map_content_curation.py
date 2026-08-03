"""Curate map POIs: notes, publish flags, and safer landmark set

Revision ID: 010_map_content_curation
Revises: 009_knowledge_sources
Create Date: 2026-08-03

Why: M6 — maps must not imply vague clinic pins are live rescue points.
Curate descriptions/source notes, unpublish unsafe vagueness, and add a few
well-known verified landmarks.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "010_map_content_curation"
down_revision: Union[str, Sequence[str], None] = "009_knowledge_sources"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# name -> fields to update (partial)
UPDATES: dict[str, dict] = {
    "Tengboche Monastery area lodges": {
        "name": "Tengboche Monastery area",
        "is_verified": True,
        "description": (
            "Famous monastery stop on the EBC trail with nearby teahouse lodges. "
            "Pin marks the monastery area, not a specific hotel."
        ),
        "source_note": (
            "Well-known Khumbu landmark — coordinates approximate to the monastery ridge. "
            "Lodge availability changes seasonally."
        ),
    },
    "Gorak Shep": {
        "is_verified": True,
        "description": (
            "Last settlement before Everest Base Camp / Kala Patthar. High, cold, and "
            "often crowded in peak season."
        ),
        "source_note": (
            "Mapped settlement area (approximate village center). Not a rescue facility."
        ),
    },
    "Annapurna Base Camp lodges": {
        "is_verified": False,
        "description": (
            "High-camp lodge cluster at Annapurna Sanctuary. Facilities and open seasons vary."
        ),
        "source_note": (
            "Editorial approximate pin for the ABC lodge area — confirm current lodges locally."
        ),
    },
    "Khunde Hospital": {
        "is_verified": False,
        "is_published": True,
        "description": (
            "Community hospital historically serving Khumbu villages. Hours and services change."
        ),
        "source_note": (
            "DEMO / approximate pin only. Not live emergency dispatch. Confirm locally with your "
            "guide or agency before relying on this location."
        ),
    },
    "HRA Pheriche Aid Post": {
        "is_verified": False,
        "description": (
            "Seasonal Himalayan Rescue Association aid post area for altitude emergencies "
            "(typically open in peak trekking seasons)."
        ),
        "source_note": (
            "DEMO / approximate pin. Seasonal and not a substitute for insurance, guides, or "
            "official rescue channels. Confirm season status before travel."
        ),
    },
    "Himalayan Rescue Association (Manang)": {
        "is_verified": False,
        "description": (
            "Aid-post area associated with Annapurna Circuit trekkers in season. "
            "Not guaranteed year-round."
        ),
        "source_note": (
            "DEMO / approximate pin. Hidden by default in TrekPal. Never use map pins alone "
            "for emergency decisions."
        ),
    },
    "Pokhara lakeside medical clinics area": {
        # Too vague to show as a hospital pin — remove from public map.
        "is_published": False,
        "source_note": (
            "Unpublished: vague city-area pin removed in M6 curation so it cannot be "
            "mistaken for a specific hospital."
        ),
    },
}

NEW_LOCATIONS = [
    {
        "name": "Pokhara Airport (Domestic)",
        "category": "trailhead",
        "latitude": 28.2000,
        "longitude": 83.9821,
        "elevation_m": 827,
        "region": "Annapurna",
        "description": (
            "Common domestic flight gateway for Annapurna region treks. "
            "Schedules and terminals change — confirm with your airline."
        ),
        "is_published": True,
        "is_verified": True,
        "source_note": (
            "Public airport landmark (approximate). Useful orientation pin, not a trek start trail."
        ),
    },
    {
        "name": "Poon Hill viewpoint",
        "category": "checkpoint",
        "latitude": 28.4000,
        "longitude": 83.6900,
        "elevation_m": 3210,
        "region": "Annapurna",
        "description": (
            "Popular sunrise viewpoint above Ghorepani on the Annapurna foothills circuit."
        ),
        "is_published": True,
        "is_verified": True,
        "source_note": (
            "Well-known viewpoint — coordinates approximate. Trails and entry fees can change."
        ),
    },
]


def _tables() -> set[str]:
    return set(inspect(op.get_bind()).get_table_names())


def upgrade() -> None:
    if "map_locations" not in _tables():
        return

    conn = op.get_bind()

    for old_name, fields in UPDATES.items():
        sets = []
        params: dict = {"old_name": old_name}
        for key, value in fields.items():
            sets.append(f"{key} = :{key}")
            params[key] = value
        conn.execute(
            sa.text(f"UPDATE map_locations SET {', '.join(sets)} WHERE name = :old_name"),
            params,
        )

    existing = {
        row[0] for row in conn.execute(sa.text("SELECT name FROM map_locations")).fetchall()
    }
    for loc in NEW_LOCATIONS:
        if loc["name"] in existing:
            continue
        conn.execute(
            sa.text(
                """
                INSERT INTO map_locations
                (name, category, latitude, longitude, elevation_m, region, description,
                 is_published, is_verified, source_note)
                VALUES
                (:name, :category, :latitude, :longitude, :elevation_m, :region, :description,
                 :is_published, :is_verified, :source_note)
                """
            ),
            loc,
        )


def downgrade() -> None:
    if "map_locations" not in _tables():
        return
    conn = op.get_bind()
    for loc in NEW_LOCATIONS:
        conn.execute(
            sa.text("DELETE FROM map_locations WHERE name = :name"),
            {"name": loc["name"]},
        )
    # Best-effort restore of unpublished clinic pin visibility only.
    conn.execute(
        sa.text(
            "UPDATE map_locations SET is_published = true "
            "WHERE name = 'Pokhara lakeside medical clinics area'"
        )
    )
