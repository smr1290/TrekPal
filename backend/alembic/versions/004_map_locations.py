"""Map locations for trekking POIs

Revision ID: 004_map_locations
Revises: 003_trip_plans
Create Date: 2026-07-29
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "004_map_locations"
down_revision: Union[str, Sequence[str], None] = "003_trip_plans"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Approximate public coordinates for Nepal trekking landmarks (demo seed data).
STARTER_LOCATIONS = [
    {
        "name": "Lukla Airport (Tenzing–Hillary)",
        "category": "trailhead",
        "latitude": 27.6870,
        "longitude": 86.7314,
        "elevation_m": 2860,
        "region": "Khumbu",
        "description": "Common EBC trailhead. Flights are weather-dependent.",
    },
    {
        "name": "Namche Bazaar",
        "category": "tea_house",
        "latitude": 27.8069,
        "longitude": 86.7140,
        "elevation_m": 3440,
        "region": "Khumbu",
        "description": "Major trading town and acclimatization stop on the EBC route.",
    },
    {
        "name": "Tengboche Monastery area lodges",
        "category": "tea_house",
        "latitude": 27.8362,
        "longitude": 86.7640,
        "elevation_m": 3867,
        "region": "Khumbu",
        "description": "Lodges near Tengboche with Everest views on clear days.",
    },
    {
        "name": "Gorak Shep",
        "category": "tea_house",
        "latitude": 27.9808,
        "longitude": 86.8284,
        "elevation_m": 5164,
        "region": "Khumbu",
        "description": "Last lodge settlement before Everest Base Camp / Kala Patthar.",
    },
    {
        "name": "Everest Base Camp viewpoint area",
        "category": "checkpoint",
        "latitude": 28.0026,
        "longitude": 86.8528,
        "elevation_m": 5364,
        "region": "Khumbu",
        "description": "High camp area on the classic EBC trek.",
    },
    {
        "name": "Khunde Hospital",
        "category": "hospital",
        "latitude": 27.8210,
        "longitude": 86.7105,
        "elevation_m": 3840,
        "region": "Khumbu",
        "description": "Community hospital serving the Khumbu region.",
    },
    {
        "name": "HRA Pheriche Aid Post",
        "category": "emergency",
        "latitude": 27.8945,
        "longitude": 86.8190,
        "elevation_m": 4371,
        "region": "Khumbu",
        "description": "Seasonal Himalayan Rescue Association post for altitude emergencies.",
    },
    {
        "name": "Sagarmatha National Park entry (Monjo)",
        "category": "checkpoint",
        "latitude": 27.7705,
        "longitude": 86.7168,
        "elevation_m": 2835,
        "region": "Khumbu",
        "description": "Park permit checkpoint on the approach to Namche.",
    },
    {
        "name": "Nayapul trailhead",
        "category": "trailhead",
        "latitude": 28.2150,
        "longitude": 83.8260,
        "elevation_m": 1070,
        "region": "Annapurna",
        "description": "Common start for Annapurna Base Camp approaches.",
    },
    {
        "name": "Ghorepani",
        "category": "tea_house",
        "latitude": 28.4003,
        "longitude": 83.6975,
        "elevation_m": 2874,
        "region": "Annapurna",
        "description": "Popular lodge village; Poon Hill sunrise viewpoint nearby.",
    },
    {
        "name": "Annapurna Base Camp lodges",
        "category": "tea_house",
        "latitude": 28.5308,
        "longitude": 83.8770,
        "elevation_m": 4130,
        "region": "Annapurna",
        "description": "High camp lodges at Annapurna Sanctuary.",
    },
    {
        "name": "Himalayan Rescue Association (Manang)",
        "category": "emergency",
        "latitude": 28.6667,
        "longitude": 84.0167,
        "elevation_m": 3540,
        "region": "Annapurna",
        "description": "Aid post area serving Annapurna Circuit trekkers in season.",
    },
    {
        "name": "Pokhara lakeside medical clinics area",
        "category": "hospital",
        "latitude": 28.2096,
        "longitude": 83.9556,
        "elevation_m": 822,
        "region": "Annapurna",
        "description": "Gateway city with hospitals/clinics before/after Annapurna treks.",
    },
    {
        "name": "ACAP checkpoint (Birethanti area)",
        "category": "checkpoint",
        "latitude": 28.2400,
        "longitude": 83.8200,
        "elevation_m": 1025,
        "region": "Annapurna",
        "description": "Conservation area permit checkpoint on popular ABC approaches.",
    },
]


def _tables() -> set[str]:
    return set(inspect(op.get_bind()).get_table_names())


def upgrade() -> None:
    if "map_locations" not in _tables():
        op.create_table(
            "map_locations",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=150), nullable=False),
            sa.Column("category", sa.String(length=40), nullable=False),
            sa.Column("latitude", sa.Float(), nullable=False),
            sa.Column("longitude", sa.Float(), nullable=False),
            sa.Column("elevation_m", sa.Integer(), nullable=True),
            sa.Column("region", sa.String(length=100), nullable=True),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("trek_id", sa.Integer(), nullable=True),
            sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=True),
            sa.ForeignKeyConstraint(["trek_id"], ["treks.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_map_locations_id"), "map_locations", ["id"], unique=False)
        op.create_index(op.f("ix_map_locations_category"), "map_locations", ["category"], unique=False)

    conn = op.get_bind()
    count = conn.execute(sa.text("SELECT COUNT(*) FROM map_locations")).scalar()
    if count == 0:
        op.bulk_insert(
            sa.table(
                "map_locations",
                sa.column("name", sa.String),
                sa.column("category", sa.String),
                sa.column("latitude", sa.Float),
                sa.column("longitude", sa.Float),
                sa.column("elevation_m", sa.Integer),
                sa.column("region", sa.String),
                sa.column("description", sa.Text),
                sa.column("is_published", sa.Boolean),
            ),
            [{**loc, "is_published": True} for loc in STARTER_LOCATIONS],
        )


def downgrade() -> None:
    if "map_locations" in _tables():
        op.drop_index(op.f("ix_map_locations_category"), table_name="map_locations")
        op.drop_index(op.f("ix_map_locations_id"), table_name="map_locations")
        op.drop_table("map_locations")
