"""Add map location verification flags

Revision ID: 007_map_location_verified
Revises: 006_gear_catalog_realism
Create Date: 2026-07-31
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "007_map_location_verified"
down_revision: Union[str, Sequence[str], None] = "006_gear_catalog_realism"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Public landmarks with commonly published coordinates (still approximate).
# Hospital / emergency pins stay unverified unless curated.
VERIFIED_LANDMARKS: dict[str, str] = {
    "Lukla Airport (Tenzing–Hillary)": (
        "Public airport landmark coordinates (approximate). Confirm locally; flights are weather-dependent."
    ),
    "Namche Bazaar": (
        "Well-known Khumbu trading town — coordinates approximate to the bazaar area."
    ),
    "Sagarmatha National Park entry (Monjo)": (
        "Commonly mapped SNP entry / checkpoint area on the EBC approach."
    ),
    "Everest Base Camp viewpoint area": (
        "Classic EBC trek destination area — coordinates approximate, not a rescue point."
    ),
    "Nayapul trailhead": (
        "Common Annapurna Base Camp approach trailhead — approximate roadside/start area."
    ),
    "Ghorepani": (
        "Popular lodge village near Poon Hill — village-center approximate."
    ),
    "ACAP checkpoint (Birethanti area)": (
        "Common ACAP checkpoint area on ABC approaches — confirm current post location."
    ),
    "Tribhuvan International Airport (Kathmandu)": (
        "Kathmandu international airport — verified public landmark for trek arrivals."
    ),
}

NEW_VERIFIED = [
    {
        "name": "Tribhuvan International Airport (Kathmandu)",
        "category": "trailhead",
        "latitude": 27.6966,
        "longitude": 85.3591,
        "elevation_m": 1338,
        "region": "Kathmandu",
        "description": "Main international arrival gateway for Nepal treks.",
        "is_published": True,
        "is_verified": True,
        "source_note": VERIFIED_LANDMARKS["Tribhuvan International Airport (Kathmandu)"],
    },
]


def upgrade() -> None:
    op.add_column(
        "map_locations",
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column("map_locations", sa.Column("source_note", sa.Text(), nullable=True))

    conn = op.get_bind()
    for name, note in VERIFIED_LANDMARKS.items():
        conn.execute(
            sa.text(
                "UPDATE map_locations SET is_verified = true, source_note = :note "
                "WHERE name = :name"
            ),
            {"name": name, "note": note},
        )

    existing = {
        row[0]
        for row in conn.execute(sa.text("SELECT name FROM map_locations")).fetchall()
    }
    for loc in NEW_VERIFIED:
        if loc["name"] in existing:
            continue
        conn.execute(
            sa.text(
                "INSERT INTO map_locations "
                "(name, category, latitude, longitude, elevation_m, region, description, "
                "is_published, is_verified, source_note) "
                "VALUES (:name, :category, :latitude, :longitude, :elevation_m, :region, "
                ":description, :is_published, :is_verified, :source_note)"
            ),
            loc,
        )


def downgrade() -> None:
    op.drop_column("map_locations", "source_note")
    op.drop_column("map_locations", "is_verified")
