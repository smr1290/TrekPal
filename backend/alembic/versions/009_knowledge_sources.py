"""Add knowledge article source labels + trusted URLs

Revision ID: 009_knowledge_sources
Revises: 008_history_destination
Create Date: 2026-08-03

Why: M5 — readers and chat users must be able to verify claims against
reputable external references (tourism board, CDC, state travel advisories).
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "009_knowledge_sources"
down_revision: Union[str, Sequence[str], None] = "008_history_destination"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Public reference pages — fees/rules change; TrekPal still says "verify before travel".
ARTICLE_SOURCES = {
    "everest-base-camp-guide": {
        "source_label": "Nepal Tourism Board — Everest region",
        "source_url": "https://ntb.gov.np/",
        "content": (
            "## Route overview\n\n"
            "The Everest Base Camp (EBC) trek is one of Nepal's most popular high-altitude routes. "
            "Most itineraries take 12–14 days round trip from Lukla, with gradual ascent to reduce altitude risk.\n\n"
            "## Highlights\n\n"
            "- Namche Bazaar acclimatization days\n"
            "- Tengboche monastery\n"
            "- Views of Everest from Kala Patthar (5,545 m)\n\n"
            "Expect teahouse lodging, varied trail conditions, and cold nights above 4,000 m.\n\n"
            "## Best seasons\n\n"
            "Pre-monsoon (March–May) and post-monsoon (late September–November) are the usual windows. "
            "Winter treks are possible but need extra cold-weather gear.\n\n"
            "Permit fees and flight schedules change — confirm current details before you book."
        ),
    },
    "nepal-trekking-permits": {
        "source_label": "Nepal Immigration / tourism guidance",
        "source_url": "https://www.immigration.gov.np/",
        "content": (
            "## What you usually need\n\n"
            "Most treks require a TIMS (Trekkers' Information Management System) card and, "
            "for protected areas, a national park or conservation area permit.\n\n"
            "## Why they exist\n\n"
            "TIMS helps authorities track trekkers for safety. Park permits (for example Sagarmatha "
            "National Park for EBC, Annapurna Conservation Area for Annapurna) fund trail maintenance "
            "and conservation.\n\n"
            "## How to apply\n\n"
            "- Use a registered agency or official counters in Kathmandu or Pokhara\n"
            "- Carry passport copies and passport-size photos\n\n"
            "Permit rules and fees change. Always verify current requirements before you travel — "
            "restricted areas (for example Upper Mustang) have additional rules."
        ),
    },
    "altitude-sickness-basics": {
        "source_label": "CDC — Travel to High Altitudes",
        "source_url": "https://wwwnc.cdc.gov/travel/page/travel-to-high-altitudes",
        "content": (
            "## What is AMS?\n\n"
            "Acute Mountain Sickness (AMS) can occur above about 2,500–3,000 m when you ascend too fast. "
            "This article is general education — not a diagnosis or prescription.\n\n"
            "## Common early signs\n\n"
            "- Headache\n"
            "- Nausea or loss of appetite\n"
            "- Dizziness\n"
            "- Poor sleep\n\n"
            "## When to descend\n\n"
            "If symptoms worsen at rest, or you notice confusion, difficulty walking, or severe "
            "breathing problems, descend immediately — do not wait until morning.\n\n"
            "## Prevention basics\n\n"
            "- Ascend gradually; add rest/acclimatization days\n"
            "- Stay hydrated; avoid alcohol while ascending\n"
            "- Discuss preventive medicine with a clinician before your trip\n\n"
            "Never ignore symptoms to \"push through\" a fixed schedule."
        ),
    },
    "teahouse-trek-packing-list": {
        "source_label": "TrekPal packing guide (editorial)",
        "source_url": "https://ntb.gov.np/",
        "content": (
            "## Clothing layers\n\n"
            "- Base layers for sweat management\n"
            "- Insulating mid-layer\n"
            "- Waterproof shell\n"
            "- Warm hat and gloves\n\n"
            "## Footwear\n\n"
            "Broken-in waterproof boots with ankle support, plus camp shoes or sandals for lodges.\n\n"
            "## Other essentials\n\n"
            "- Headlamp\n"
            "- Water purification\n"
            "- Sun protection (SPF, lip balm, sunglasses)\n"
            "- First-aid kit and power bank\n"
            "- Copies of permits and passport\n\n"
            "You can buy or rent sleeping bags and down jackets in Kathmandu or Pokhara. "
            "Pack light — porters have weight limits, and you will carry a daypack daily."
        ),
    },
    "trail-safety-basics": {
        "source_label": "U.S. State Department — Nepal travel",
        "source_url": "https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Nepal.html",
        "content": (
            "## Weather and timing\n\n"
            "Mountain weather shifts quickly. Check forecasts when possible, but expect fog, rain, "
            "and cold even in \"good\" seasons.\n\n"
            "## Trail conditions\n\n"
            "- Monsoon trails can be slippery\n"
            "- Post-monsoon may have loose rock after rains\n"
            "- Start early to cross passes before afternoon clouds build\n\n"
            "## Planning margins\n\n"
            "Add 1–2 buffer days for acclimatization or delays. Share your route with someone at home. "
            "Register with TIMS where required and follow local guide advice in active weather.\n\n"
            "Official travel advisories change — read the latest guidance for your nationality before departure."
        ),
    },
    "nepal-emergency-contacts": {
        "source_label": "Nepal Police / tourist assistance references",
        "source_url": "https://www.nepalpolice.gov.np/",
        "content": (
            "## Core numbers (verify locally)\n\n"
            "- Nepal emergency police: 100\n"
            "- Ambulance (Kathmandu valley): 102\n"
            "- Tourist police (Kathmandu): +977-1-4247041\n\n"
            "## Remote rescues\n\n"
            "Helicopter evacuation is common in remote areas but expensive. Travel insurance with "
            "high-altitude evacuation cover is strongly recommended.\n\n"
            "## Before you leave town\n\n"
            "- Save your guide's number and lodge contacts\n"
            "- Save embassy/consulate details for your nationality\n\n"
            "In Sagarmatha and Annapurna regions, lodge owners often help coordinate local help "
            "when phone signal is limited. Numbers and procedures can change — confirm with your "
            "agency or lodge on arrival."
        ),
    },
}


def _tables() -> set[str]:
    bind = op.get_bind()
    return set(inspect(bind).get_table_names())


def _columns(table: str) -> set[str]:
    bind = op.get_bind()
    return {c["name"] for c in inspect(bind).get_columns(table)}


def upgrade() -> None:
    if "knowledge_articles" not in _tables():
        return

    cols = _columns("knowledge_articles")
    if "source_label" not in cols:
        op.add_column(
            "knowledge_articles",
            sa.Column("source_label", sa.String(length=200), nullable=True),
        )

    conn = op.get_bind()
    for slug, payload in ARTICLE_SOURCES.items():
        conn.execute(
            sa.text(
                """
                UPDATE knowledge_articles
                SET source_label = :source_label,
                    source_url = :source_url,
                    content = :content,
                    updated_at = now()
                WHERE slug = :slug
                """
            ),
            {
                "slug": slug,
                "source_label": payload["source_label"],
                "source_url": payload["source_url"],
                "content": payload["content"],
            },
        )


def downgrade() -> None:
    if "knowledge_articles" not in _tables():
        return
    if "source_label" in _columns("knowledge_articles"):
        op.drop_column("knowledge_articles", "source_label")
