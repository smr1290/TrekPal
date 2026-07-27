"""Knowledge base articles table + starter content

Revision ID: 002_knowledge_articles
Revises: 001_initial_trekpal
Create Date: 2026-07-27
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "002_knowledge_articles"
down_revision: Union[str, Sequence[str], None] = "001_initial_trekpal"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


STARTER_ARTICLES = [
    {
        "title": "Everest Base Camp trek overview",
        "slug": "everest-base-camp-guide",
        "category": "trek_guide",
        "summary": "Route basics, best seasons, and what to expect on the classic EBC trail.",
        "content": (
            "The Everest Base Camp (EBC) trek is one of Nepal's most popular high-altitude routes. "
            "Most itineraries take 12–14 days round trip from Lukla, with gradual ascent to reduce altitude risk.\n\n"
            "Typical highlights: Namche Bazaar acclimatization, Tengboche monastery, and views of Everest "
            "from Kala Patthar (5,545 m). Expect teahouse lodging, varied trail conditions, and cold nights "
            "above 4,000 m.\n\n"
            "Best seasons: pre-monsoon (March–May) and post-monsoon (late September–November). "
            "Winter treks are possible but require extra cold-weather gear."
        ),
        "source_url": None,
    },
    {
        "title": "TIMS card and trekking permits in Nepal",
        "slug": "nepal-trekking-permits",
        "category": "permit",
        "summary": "What TIMS and national park permits are, and when you need them.",
        "content": (
            "Most treks in Nepal require a TIMS (Trekkers' Information Management System) card and, "
            "for protected areas, a national park or conservation area permit.\n\n"
            "TIMS helps authorities track trekkers for safety. Park permits (e.g. Sagarmatha National Park "
            "for EBC, Annapurna Conservation Area for Annapurna) fund trail maintenance and conservation.\n\n"
            "Apply through a registered agency or at official counters in Kathmandu or Pokhara. "
            "Carry passport copies and passport-size photos. Permit rules change — verify current fees "
            "and requirements before you travel."
        ),
        "source_url": None,
    },
    {
        "title": "Altitude sickness: signs and what to do",
        "slug": "altitude-sickness-basics",
        "category": "medical",
        "summary": "Recognize AMS symptoms early and know when to descend.",
        "content": (
            "Acute Mountain Sickness (AMS) can occur above 2,500–3,000 m when you ascend too fast. "
            "Common symptoms: headache, nausea, dizziness, poor sleep, and loss of appetite.\n\n"
            "If symptoms worsen at rest, or you notice confusion, difficulty walking, or fluid in lungs "
            "(HAPE/HACE), descend immediately — do not wait until morning.\n\n"
            "Prevention: climb high, sleep low; add rest days; stay hydrated; avoid alcohol. "
            "Discuss acetazolamide (Diamox) with a doctor before your trip. Never ignore symptoms "
            "to 'push through' on a schedule."
        ),
        "source_url": None,
    },
    {
        "title": "Essential packing list for teahouse treks",
        "slug": "teahouse-trek-packing-list",
        "category": "packing",
        "summary": "Core clothing and gear for a typical Nepal teahouse trek.",
        "content": (
            "Layering is key: base layers, insulating mid-layer, waterproof shell, warm hat, and gloves.\n\n"
            "Footwear: broken-in waterproof boots with ankle support. Camp shoes or sandals for lodges.\n\n"
            "Other essentials: headlamp, water purification, sun protection (SPF + lip balm + sunglasses), "
            "first-aid kit, power bank, and copies of permits/passport.\n\n"
            "You can buy or rent sleeping bags and down jackets in Kathmandu or Pokhara if needed. "
            "Pack light — porters have weight limits, and you'll carry a daypack daily."
        ),
        "source_url": None,
    },
    {
        "title": "Trail safety: weather, landslides, and planning margins",
        "slug": "trail-safety-basics",
        "category": "safety",
        "summary": "Build buffer days and respect local conditions on Himalayan trails.",
        "content": (
            "Mountain weather shifts quickly. Check forecasts when possible, but expect fog, rain, "
            "and cold even in 'good' seasons.\n\n"
            "Monsoon trails can be slippery; post-monsoon may have loose rock after rains. "
            "Start early to cross passes before afternoon clouds build.\n\n"
            "Add 1–2 buffer days to your itinerary for acclimatization or delays. "
            "Share your route with someone at home. Register with TIMS and follow guide/porter "
            "advice in active weather."
        ),
        "source_url": None,
    },
    {
        "title": "Emergency contacts in Nepal",
        "slug": "nepal-emergency-contacts",
        "category": "emergency",
        "summary": "Key numbers and who to call when something goes wrong on a trek.",
        "content": (
            "Nepal emergency police: 100\n"
            "Ambulance (Kathmandu valley): 102\n"
            "Tourist police (Kathmandu): +977-1-4247041\n\n"
            "For remote rescues, helicopter evacuation is common but expensive — travel insurance "
            "with high-altitude evacuation cover is strongly recommended.\n\n"
            "Save your guide's number, lodge contacts, and embassy details before leaving town. "
            "In Sagarmatha and Annapurna regions, lodge owners often help coordinate local help "
            "when phone signal is limited."
        ),
        "source_url": None,
    },
]


def _tables() -> set[str]:
    bind = op.get_bind()
    return set(inspect(bind).get_table_names())


def upgrade() -> None:
    existing = _tables()

    if "knowledge_articles" not in existing:
        op.create_table(
            "knowledge_articles",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(length=200), nullable=False),
            sa.Column("slug", sa.String(length=220), nullable=False),
            sa.Column("category", sa.String(length=50), nullable=False),
            sa.Column("summary", sa.String(length=500), nullable=False),
            sa.Column("content", sa.Text(), nullable=False),
            sa.Column("trek_id", sa.Integer(), nullable=True),
            sa.Column("source_url", sa.Text(), nullable=True),
            sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=True),
            sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=True),
            sa.ForeignKeyConstraint(["trek_id"], ["treks.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("slug"),
        )
        op.create_index(op.f("ix_knowledge_articles_id"), "knowledge_articles", ["id"], unique=False)
        op.create_index(op.f("ix_knowledge_articles_slug"), "knowledge_articles", ["slug"], unique=True)
        op.create_index(
            op.f("ix_knowledge_articles_category"), "knowledge_articles", ["category"], unique=False
        )

    conn = op.get_bind()
    count = conn.execute(sa.text("SELECT COUNT(*) FROM knowledge_articles")).scalar()
    if count == 0:
        op.bulk_insert(
            sa.table(
                "knowledge_articles",
                sa.column("title", sa.String),
                sa.column("slug", sa.String),
                sa.column("category", sa.String),
                sa.column("summary", sa.String),
                sa.column("content", sa.Text),
                sa.column("source_url", sa.Text),
                sa.column("is_published", sa.Boolean),
            ),
            [{**a, "is_published": True} for a in STARTER_ARTICLES],
        )


def downgrade() -> None:
    if "knowledge_articles" in _tables():
        op.drop_index(op.f("ix_knowledge_articles_category"), table_name="knowledge_articles")
        op.drop_index(op.f("ix_knowledge_articles_slug"), table_name="knowledge_articles")
        op.drop_index(op.f("ix_knowledge_articles_id"), table_name="knowledge_articles")
        op.drop_table("knowledge_articles")
