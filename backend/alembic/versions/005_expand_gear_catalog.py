"""Expand gear catalog for structured recommendations

Revision ID: 005_expand_gear_catalog
Revises: 004_map_locations
Create Date: 2026-07-29
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "005_expand_gear_catalog"
down_revision: Union[str, Sequence[str], None] = "004_map_locations"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Keep in sync with backend.ml.gear_recommend.CATALOG_SEED
CATALOG_SEED = [
    ("Hiking Boots", "Footwear", "Broken-in waterproof mid-cut boots for rocky trails."),
    ("Camp Sandals", "Footwear", "Light sandals for evenings and river crossings."),
    ("Trekking Socks", "Footwear", "Moisture-wicking socks; pack several pairs for multi-day treks."),
    ("Down Jacket", "Clothing", "Insulated jacket for cold mornings and high camps."),
    ("Fleece Midlayer", "Clothing", "Warm midlayer for hiking and evenings in lodges."),
    ("Thermal Base Layer", "Clothing", "Moisture-wicking base layer for cold altitude nights."),
    ("Rain Jacket", "Clothing", "Waterproof breathable shell for monsoon and afternoon storms."),
    ("Rain Poncho", "Clothing", "Lightweight rain protection that covers pack and body."),
    ("Warm Gloves", "Clothing", "Insulated gloves for cold passes and early starts."),
    ("Sun Hat", "Clothing", "Wide-brim or cap for strong high-altitude UV."),
    ("Trekking Backpack 50L", "Accessories", "50–65L pack sized for teahouse multi-day treks."),
    ("Trekking Poles", "Accessories", "Adjustable poles that reduce knee load on descents."),
    ("Sleeping Bag -10C", "Camping", "Cold-weather bag for high teahouse nights."),
    ("Water Bottle 1L", "Hydration", "Durable bottle; carry at least 1–2L capacity."),
    ("Water Purification Tablets", "Hydration", "Treat lodge or stream water when bottled water is scarce."),
    ("Headlamp", "Safety", "Hands-free light for pre-dawn starts and lodge nights."),
    ("First Aid Kit", "Safety", "Blister care, pain relief, antiseptic, personal meds."),
    ("Sunglasses", "Accessories", "UV protection; critical on snow and above 3,000 m."),
    ("Sunscreen SPF 50", "Accessories", "High SPF for intense Himalayan UV reflection."),
    ("Power Bank", "Accessories", "Lodge charging is unreliable; keep devices alive for maps/SOS."),
    ("Gaiters", "Accessories", "Keep snow, mud, and scree out of boots."),
    ("Microspikes", "Accessories", "Traction for icy trails in winter or high passes."),
    ("Buff Neck Gaiter", "Clothing", "Dust, wind, and sun protection for the face and neck."),
]


def upgrade() -> None:
    conn = op.get_bind()
    existing = {
        row[0].strip().lower()
        for row in conn.execute(sa.text("SELECT gear_name FROM gear")).fetchall()
        if row[0]
    }
    for name, category, description in CATALOG_SEED:
        if name.strip().lower() in existing:
            continue
        conn.execute(
            sa.text(
                "INSERT INTO gear (gear_name, category, description) "
                "VALUES (:name, :category, :description)"
            ),
            {"name": name, "category": category, "description": description},
        )
        existing.add(name.strip().lower())


def downgrade() -> None:
    # Do not delete gear rows — they may be linked from trek_gear_recommendations.
    pass
