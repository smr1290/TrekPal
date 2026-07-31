"""Add slug/quantity/rent hints and refresh Nepal gear catalog

Revision ID: 006_gear_catalog_realism
Revises: 005_expand_gear_catalog
Create Date: 2026-07-31
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "006_gear_catalog_realism"
down_revision: Union[str, Sequence[str], None] = "005_expand_gear_catalog"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Keep aligned with backend.ml.gear_recommend.CATALOG_SEED
CATALOG_SEED = [
    ("hiking-boots", "Hiking Boots (waterproof, broken-in)", "Footwear", "Mid-cut waterproof boots. Break them in for 2+ weeks before the trek.", "1 pair", "Buy preferred; rent only if arriving late. Thamel & Lakeside have many shops."),
    ("camp-sandals", "Camp Sandals", "Footwear", "Light sandals for lodges, toilets, and river crossings.", "1 pair", "Cheap to buy in Thamel/Pokhara; no need to rent."),
    ("trekking-socks", "Merino / Trekking Socks", "Footwear", "Moisture-wicking socks reduce blisters; rotate and dry nightly.", "3–4 pairs (more for 10+ days)", "Buy — personal item. Easy to find in Thamel."),
    ("down-jacket", "Down / Synthetic Insulated Jacket", "Clothing", "Warmth for high camps and cold mornings. Synthetic stays warmer when damp.", "1", "Widely rented in Thamel for EBC/ABC — inspect loft and zippers."),
    ("fleece-midlayer", "Fleece Midlayer", "Clothing", "Breathable midlayer for hiking and lodge evenings.", "1", "Buy or bring from home; inexpensive in Nepal."),
    ("thermal-base-layer", "Thermal Base Layer (top + bottom)", "Clothing", "Moisture-wicking base layers for cold nights above ~4,000 m.", "1 set (2 sets if winter)", "Buy — hygiene item. Common in Thamel."),
    ("rain-jacket", "Waterproof Rain Jacket (shell)", "Clothing", "Breathable waterproof shell for afternoon storms and monsoon spray.", "1", "Rent or buy in Thamel/Pokhara; check taped seams."),
    ("rain-pants", "Rain Pants / Softshell Pants", "Clothing", "Keep legs dry on wet trail days; softshell is versatile in shoulder seasons.", "1", "Often bundled with jacket rentals in Thamel."),
    ("trekking-pants", "Quick-dry Trekking Pants", "Clothing", "Light, quick-dry pants for daily hiking.", "1–2 pairs", "Buy — cheap and plentiful in Nepal."),
    ("warm-gloves", "Insulated Gloves", "Clothing", "Warm gloves for passes and pre-dawn starts.", "1 pair (+ liner gloves optional)", "Buy or rent with high-altitude kits."),
    ("sun-hat", "Sun Hat / Cap", "Clothing", "Shade for strong Himalayan UV.", "1", "Buy — very cheap locally."),
    ("buff", "Buff / Neck Gaiter", "Clothing", "Dust, wind, cold, and sun protection for face and neck.", "1–2", "Buy. Essential on dusty Mustang / Kali Gandaki corridors."),
    ("backpack-50l", "Trekking Backpack 50–65L", "Accessories", "Main pack for teahouse treks. Use a rain cover.", "1 (+ daypack if using porter)", "Easy to rent in Thamel; check hip belt fit and zippers."),
    ("daypack", "Daypack 20–30L", "Accessories", "Carry water, layers, and snacks while a porter takes the main bag.", "1 (if using porter)", "Rent with main pack or buy inexpensive options in Thamel."),
    ("trekking-poles", "Trekking Poles", "Accessories", "Reduce knee load on long Himalayan descents.", "1 pair", "Very cheap to rent in Thamel/Pokhara."),
    ("sleeping-bag-10c", "Sleeping Bag (comfort ~−10°C)", "Camping", "Teahouse blankets vary; bring a bag rated for expected night temps.", "1", "Common rental in Thamel — ask for temperature rating in writing."),
    ("water-bottle", "Water Bottles / Soft Flask (1–2L total)", "Hydration", "Carry enough for each hiking day; refill at lodges.", "1–2 L capacity", "Buy. Consider a filter bottle to cut plastic waste."),
    ("water-purification", "Water Purification (tablets or filter)", "Hydration", "Treat lodge/stream water when bottled water is scarce or expensive.", "Enough for trip length", "Buy tablets/filter in Thamel pharmacies or outdoor shops."),
    ("headlamp", "Headlamp + spare batteries", "Safety", "Hands-free light for early starts and dark lodges.", "1 + spare cells", "Buy preferred; batteries sell out on busy trails."),
    ("first-aid-kit", "Personal First Aid Kit", "Safety", "Blister care, pain relief, antiseptic, tape, personal prescriptions.", "1 kit", "Assemble yourself. Pharmacies in KTM/Pokhara stock basics."),
    ("sunglasses", "UV Sunglasses (category 3–4)", "Accessories", "Protect eyes from UV and snow glare above ~3,000 m.", "1 (+ spare if possible)", "Buy. Glacier-style glasses useful for high snow sections."),
    ("sunscreen", "Sunscreen SPF 50+ & Lip Balm SPF", "Accessories", "UV is intense at altitude even on cloudy days.", "1 tube + lip balm", "Buy before departure or in Kathmandu."),
    ("power-bank", "Power Bank 10,000–20,000 mAh", "Accessories", "Lodge charging is slow/paid; keep phone for maps and emergencies.", "1 (2 on long remote routes)", "Buy — do not rely on lodge outlets alone."),
    ("gaiters", "Gaiters", "Accessories", "Keep snow, mud, and scree out of boots.", "1 pair", "Often included in winter/high-pass rental kits."),
    ("microspikes", "Microspikes / Traction Devices", "Accessories", "Traction for icy trails on winter routes and high passes.", "1 pair", "Rent in Thamel for winter EBC / Thorong La; check fit on your boots."),
    ("passport-pouch", "Money Belt / Passport Pouch", "Accessories", "Keep passport, permits, cash, and cards secure and dry.", "1", "Buy. Carry photocopies separately."),
    ("quick-dry-towel", "Quick-dry Towel", "Camping", "Lodges may not provide towels; pack a compact one.", "1", "Buy — inexpensive in Thamel."),
    ("dry-bags", "Dry Bags / Pack Liners", "Accessories", "Keep sleeping bag and clothes dry in rain or mule spray.", "2–3 (or one full pack liner)", "Buy. Critical in monsoon / summer."),
]


def upgrade() -> None:
    op.add_column("gear", sa.Column("slug", sa.String(length=80), nullable=True))
    op.add_column("gear", sa.Column("quantity_hint", sa.String(length=80), nullable=True))
    op.add_column("gear", sa.Column("rent_hint", sa.Text(), nullable=True))
    op.create_index("ix_gear_slug", "gear", ["slug"], unique=True)

    conn = op.get_bind()
    rows = conn.execute(sa.text("SELECT id, gear_name, slug FROM gear")).fetchall()
    by_slug = {r[2]: r[0] for r in rows if r[2]}
    by_name = {(r[1] or "").strip().lower(): r[0] for r in rows}

    for slug, name, category, description, quantity, rent in CATALOG_SEED:
        gear_id = by_slug.get(slug) or by_name.get(name.strip().lower())
        if gear_id is None:
            # Match older short names loosely
            for existing_name, eid in by_name.items():
                compact = "".join(ch for ch in existing_name if ch.isalnum())
                if slug.replace("-", "")[:6] in compact:
                    gear_id = eid
                    break

        if gear_id is None:
            conn.execute(
                sa.text(
                    "INSERT INTO gear (gear_name, category, description, slug, quantity_hint, rent_hint) "
                    "VALUES (:name, :category, :description, :slug, :quantity, :rent)"
                ),
                {
                    "name": name,
                    "category": category,
                    "description": description,
                    "slug": slug,
                    "quantity": quantity,
                    "rent": rent,
                },
            )
            by_slug[slug] = -1
            by_name[name.strip().lower()] = -1
        else:
            conn.execute(
                sa.text(
                    "UPDATE gear SET gear_name=:name, category=:category, description=:description, "
                    "slug=:slug, quantity_hint=:quantity, rent_hint=:rent WHERE id=:id"
                ),
                {
                    "id": gear_id,
                    "name": name,
                    "category": category,
                    "description": description,
                    "slug": slug,
                    "quantity": quantity,
                    "rent": rent,
                },
            )
            by_slug[slug] = gear_id
            by_name[name.strip().lower()] = gear_id


def downgrade() -> None:
    op.drop_index("ix_gear_slug", table_name="gear")
    op.drop_column("gear", "rent_hint")
    op.drop_column("gear", "quantity_hint")
    op.drop_column("gear", "slug")
