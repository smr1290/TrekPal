"""Structured, Nepal-realistic gear recommendations.

Design
------
Each catalog item has a stable **slug**. Needs declare which slug they want.
That avoids fragile name matching ("head lamp" vs "Headlamp").

Recommendations also include:
- quantity hints (e.g. "3–4 pairs")
- rent/buy tips for Kathmandu (Thamel) / Pokhara
- route overlays (EBC, Annapurna, Mustang, …) when destination is known

These are packing *checklists*, not medical advice. AMS medications stay as
disclaimer text, not a forced product.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Literal

Priority = Literal["essential", "recommended", "optional"]


@dataclass(frozen=True)
class GearNeed:
    slug: str
    priority: Priority
    reason: str


@dataclass
class GearPick:
    gear: Any
    priority: Priority
    reason: str
    score: int
    need_key: str
    quantity: str | None = None
    rent_hint: str | None = None


# Realistic teahouse-trek packing inventory for Nepal.
# Keep migration 006 in sync with this list.
CATALOG_SEED: list[dict[str, str]] = [
    {
        "slug": "hiking-boots",
        "gear_name": "Hiking Boots (waterproof, broken-in)",
        "category": "Footwear",
        "description": "Mid-cut waterproof boots. Break them in for 2+ weeks before the trek.",
        "quantity_hint": "1 pair",
        "rent_hint": "Buy preferred; rent only if arriving late. Thamel & Lakeside have many shops.",
    },
    {
        "slug": "camp-sandals",
        "gear_name": "Camp Sandals",
        "category": "Footwear",
        "description": "Light sandals for lodges, toilets, and river crossings.",
        "quantity_hint": "1 pair",
        "rent_hint": "Cheap to buy in Thamel/Pokhara; no need to rent.",
    },
    {
        "slug": "trekking-socks",
        "gear_name": "Merino / Trekking Socks",
        "category": "Footwear",
        "description": "Moisture-wicking socks reduce blisters; rotate and dry nightly.",
        "quantity_hint": "3–4 pairs (more for 10+ days)",
        "rent_hint": "Buy — personal item. Easy to find in Thamel.",
    },
    {
        "slug": "down-jacket",
        "gear_name": "Down / Synthetic Insulated Jacket",
        "category": "Clothing",
        "description": "Warmth for high camps and cold mornings. Synthetic stays warmer when damp.",
        "quantity_hint": "1",
        "rent_hint": "Widely rented in Thamel for EBC/ABC — inspect loft and zippers.",
    },
    {
        "slug": "fleece-midlayer",
        "gear_name": "Fleece Midlayer",
        "category": "Clothing",
        "description": "Breathable midlayer for hiking and lodge evenings.",
        "quantity_hint": "1",
        "rent_hint": "Buy or bring from home; inexpensive in Nepal.",
    },
    {
        "slug": "thermal-base-layer",
        "gear_name": "Thermal Base Layer (top + bottom)",
        "category": "Clothing",
        "description": "Moisture-wicking base layers for cold nights above ~4,000 m.",
        "quantity_hint": "1 set (2 sets if winter)",
        "rent_hint": "Buy — hygiene item. Common in Thamel.",
    },
    {
        "slug": "rain-jacket",
        "gear_name": "Waterproof Rain Jacket (shell)",
        "category": "Clothing",
        "description": "Breathable waterproof shell for afternoon storms and monsoon spray.",
        "quantity_hint": "1",
        "rent_hint": "Rent or buy in Thamel/Pokhara; check taped seams.",
    },
    {
        "slug": "rain-pants",
        "gear_name": "Rain Pants / Softshell Pants",
        "category": "Clothing",
        "description": "Keep legs dry on wet trail days; softshell is versatile in shoulder seasons.",
        "quantity_hint": "1",
        "rent_hint": "Often bundled with jacket rentals in Thamel.",
    },
    {
        "slug": "trekking-pants",
        "gear_name": "Quick-dry Trekking Pants",
        "category": "Clothing",
        "description": "Light, quick-dry pants for daily hiking.",
        "quantity_hint": "1–2 pairs",
        "rent_hint": "Buy — cheap and plentiful in Nepal.",
    },
    {
        "slug": "warm-gloves",
        "gear_name": "Insulated Gloves",
        "category": "Clothing",
        "description": "Warm gloves for passes and pre-dawn starts.",
        "quantity_hint": "1 pair (+ liner gloves optional)",
        "rent_hint": "Buy or rent with high-altitude kits.",
    },
    {
        "slug": "sun-hat",
        "gear_name": "Sun Hat / Cap",
        "category": "Clothing",
        "description": "Shade for strong Himalayan UV.",
        "quantity_hint": "1",
        "rent_hint": "Buy — very cheap locally.",
    },
    {
        "slug": "buff",
        "gear_name": "Buff / Neck Gaiter",
        "category": "Clothing",
        "description": "Dust, wind, cold, and sun protection for face and neck.",
        "quantity_hint": "1–2",
        "rent_hint": "Buy. Essential on dusty Mustang / Kali Gandaki corridors.",
    },
    {
        "slug": "backpack-50l",
        "gear_name": "Trekking Backpack 50–65L",
        "category": "Accessories",
        "description": "Main pack for teahouse treks. Use a rain cover.",
        "quantity_hint": "1 (+ daypack if using porter)",
        "rent_hint": "Easy to rent in Thamel; check hip belt fit and zippers.",
    },
    {
        "slug": "daypack",
        "gear_name": "Daypack 20–30L",
        "category": "Accessories",
        "description": "Carry water, layers, and snacks while a porter takes the main bag.",
        "quantity_hint": "1 (if using porter)",
        "rent_hint": "Rent with main pack or buy inexpensive options in Thamel.",
    },
    {
        "slug": "trekking-poles",
        "gear_name": "Trekking Poles",
        "category": "Accessories",
        "description": "Reduce knee load on long Himalayan descents.",
        "quantity_hint": "1 pair",
        "rent_hint": "Very cheap to rent in Thamel/Pokhara.",
    },
    {
        "slug": "sleeping-bag-10c",
        "gear_name": "Sleeping Bag (comfort ~−10°C)",
        "category": "Camping",
        "description": "Teahouse blankets vary; bring a bag rated for expected night temps.",
        "quantity_hint": "1",
        "rent_hint": "Common rental in Thamel — ask for temperature rating in writing.",
    },
    {
        "slug": "water-bottle",
        "gear_name": "Water Bottles / Soft Flask (1–2L total)",
        "category": "Hydration",
        "description": "Carry enough for each hiking day; refill at lodges.",
        "quantity_hint": "1–2 L capacity",
        "rent_hint": "Buy. Consider a filter bottle to cut plastic waste.",
    },
    {
        "slug": "water-purification",
        "gear_name": "Water Purification (tablets or filter)",
        "category": "Hydration",
        "description": "Treat lodge/stream water when bottled water is scarce or expensive.",
        "quantity_hint": "Enough for trip length",
        "rent_hint": "Buy tablets/filter in Thamel pharmacies or outdoor shops.",
    },
    {
        "slug": "headlamp",
        "gear_name": "Headlamp + spare batteries",
        "category": "Safety",
        "description": "Hands-free light for early starts and dark lodges.",
        "quantity_hint": "1 + spare cells",
        "rent_hint": "Buy preferred; batteries sell out on busy trails.",
    },
    {
        "slug": "first-aid-kit",
        "gear_name": "Personal First Aid Kit",
        "category": "Safety",
        "description": "Blister care, pain relief, antiseptic, tape, personal prescriptions.",
        "quantity_hint": "1 kit",
        "rent_hint": "Assemble yourself. Pharmacies in KTM/Pokhara stock basics.",
    },
    {
        "slug": "sunglasses",
        "gear_name": "UV Sunglasses (category 3–4)",
        "category": "Accessories",
        "description": "Protect eyes from UV and snow glare above ~3,000 m.",
        "quantity_hint": "1 (+ spare if possible)",
        "rent_hint": "Buy. Glacier-style glasses useful for high snow sections.",
    },
    {
        "slug": "sunscreen",
        "gear_name": "Sunscreen SPF 50+ & Lip Balm SPF",
        "category": "Accessories",
        "description": "UV is intense at altitude even on cloudy days.",
        "quantity_hint": "1 tube + lip balm",
        "rent_hint": "Buy before departure or in Kathmandu.",
    },
    {
        "slug": "power-bank",
        "gear_name": "Power Bank 10,000–20,000 mAh",
        "category": "Accessories",
        "description": "Lodge charging is slow/paid; keep phone for maps and emergencies.",
        "quantity_hint": "1 (2 on long remote routes)",
        "rent_hint": "Buy — do not rely on lodge outlets alone.",
    },
    {
        "slug": "gaiters",
        "gear_name": "Gaiters",
        "category": "Accessories",
        "description": "Keep snow, mud, and scree out of boots.",
        "quantity_hint": "1 pair",
        "rent_hint": "Often included in winter/high-pass rental kits.",
    },
    {
        "slug": "microspikes",
        "gear_name": "Microspikes / Traction Devices",
        "category": "Accessories",
        "description": "Traction for icy trails on winter routes and high passes.",
        "quantity_hint": "1 pair",
        "rent_hint": "Rent in Thamel for winter EBC / Thorong La; check fit on your boots.",
    },
    {
        "slug": "passport-pouch",
        "gear_name": "Money Belt / Passport Pouch",
        "category": "Accessories",
        "description": "Keep passport, permits, cash, and cards secure and dry.",
        "quantity_hint": "1",
        "rent_hint": "Buy. Carry photocopies separately.",
    },
    {
        "slug": "quick-dry-towel",
        "gear_name": "Quick-dry Towel",
        "category": "Camping",
        "description": "Lodges may not provide towels; pack a compact one.",
        "quantity_hint": "1",
        "rent_hint": "Buy — inexpensive in Thamel.",
    },
    {
        "slug": "dry-bags",
        "gear_name": "Dry Bags / Pack Liners",
        "category": "Accessories",
        "description": "Keep sleeping bag and clothes dry in rain or mule spray.",
        "quantity_hint": "2–3 (or one full pack liner)",
        "rent_hint": "Buy. Critical in monsoon / summer.",
    },
]


def _norm_dest(destination: str | None) -> str:
    return (destination or "").strip().lower()


def build_needs(
    *,
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
    risk: str,
    destination: str | None = None,
) -> list[GearNeed]:
    """Decide which gear slugs matter for this trip profile."""
    alt = float(altitude)
    days = float(duration)
    dest = _norm_dest(destination)

    needs: list[GearNeed] = [
        GearNeed("hiking-boots", "essential", "Broken-in waterproof boots prevent blisters on rocky Nepal trails."),
        GearNeed("backpack-50l", "essential", "A 50–65L pack fits teahouse multi-day layers and kit."),
        GearNeed("water-bottle", "essential", "Carry reliable water capacity every hiking day."),
        GearNeed("first-aid-kit", "essential", "Blisters and minor injuries are common — pack a personal kit."),
        GearNeed("headlamp", "essential", "Early starts and dark lodges need hands-free light."),
        GearNeed("rain-jacket", "essential", "Afternoon storms are common; staying dry keeps you warmer and safer."),
        GearNeed("sunscreen", "essential", "Himalayan UV is intense even when cloudy."),
        GearNeed("trekking-pants", "essential", "Quick-dry pants are the daily hiking uniform on teahouse treks."),
        GearNeed("passport-pouch", "essential", "Permits and ID are checked at posts — keep documents dry and on you."),
        GearNeed("sun-hat", "recommended", "Shade your face and neck on long exposed climbs."),
        GearNeed("fleece-midlayer", "recommended", "A breathable midlayer works for hiking and cool evenings."),
        GearNeed("trekking-poles", "recommended", "Poles save knees on long Himalayan descents."),
        GearNeed("buff", "recommended", "Useful for dust, cold wind, and sun on open ridges."),
    ]

    if alt >= 3000:
        needs.append(GearNeed("sunglasses", "essential", "Strong UV and snow glare above ~3,000 m can damage eyes."))
        needs.append(GearNeed("trekking-socks", "recommended", "Dry socks prevent blisters and cold feet at altitude."))

    if alt >= 3500 or season == "Winter":
        needs.append(
            GearNeed(
                "down-jacket",
                "essential",
                "High camps and early mornings get cold fast — insulation is non-negotiable.",
            )
        )

    if alt >= 4000 or season == "Winter":
        needs.append(GearNeed("thermal-base-layer", "essential", "Base layers matter when night temps drop hard."))
        glove_priority: Priority = "essential" if season == "Winter" or alt >= 4500 else "recommended"
        needs.append(GearNeed("warm-gloves", glove_priority, "Cold fingers reduce grip on poles and ladders."))
        needs.append(
            GearNeed(
                "sleeping-bag-10c",
                "essential",
                "Teahouse blankets vary; bring a bag rated for expected night temps.",
            )
        )

    if alt >= 4500 or season == "Winter" or (trek_type == "Hard" and alt >= 4000):
        gaiter_p: Priority = "essential" if season == "Winter" else "recommended"
        needs.append(GearNeed("gaiters", gaiter_p, "Keep snow and scree out of boots on high or winter trails."))

    if season == "Winter" or (alt >= 4800 and season in {"Autumn", "Spring"}):
        trac_p: Priority = "recommended" if season == "Winter" else "optional"
        needs.append(GearNeed("microspikes", trac_p, "Icy sections appear on high passes — traction prevents slips."))

    if season == "Summer" or "monsoon" in dest:
        needs.append(GearNeed("rain-pants", "essential", "Monsoon/summer trails stay wet — protect legs and boots."))
        needs.append(GearNeed("dry-bags", "essential", "Keep sleeping bag and spare clothes dry in heavy rain."))
    elif season in {"Spring", "Autumn"}:
        needs.append(GearNeed("dry-bags", "recommended", "Pack liners protect kit if an afternoon storm hits."))

    if days >= 4:
        needs.append(GearNeed("power-bank", "recommended", "Lodge charging is slow or paid — keep maps/phone powered."))
        needs.append(
            GearNeed(
                "water-purification",
                "recommended",
                "Treating water is cheaper and more reliable than buying bottles daily.",
            )
        )
        needs.append(GearNeed("quick-dry-towel", "optional", "Lodges often do not provide towels."))

    if days >= 7:
        needs.append(GearNeed("camp-sandals", "recommended", "Rest your feet in lodges after long days in boots."))
        needs.append(GearNeed("daypack", "recommended", "Use a daypack if a porter carries your main bag."))
        if not any(n.slug == "trekking-socks" for n in needs):
            needs.append(GearNeed("trekking-socks", "recommended", "Multi-day treks need spare socks while others dry."))

    # Route-specific overlays (real Nepal trek differences).
    if any(k in dest for k in ("everest", "ebc", "gokyo", "khumbu", "lukla")):
        needs.append(
            GearNeed(
                "sleeping-bag-10c",
                "essential",
                "Khumbu nights are cold — a −10°C-rated bag (or colder) is standard for EBC/Gokyo.",
            )
        )
        if season == "Winter":
            needs.append(
                GearNeed(
                    "microspikes",
                    "essential",
                    "Winter Khumbu trails and passes often have ice — pack traction.",
                )
            )

    if any(k in dest for k in ("annapurna circuit", "thorong", "manang")):
        needs.append(
            GearNeed(
                "trekking-poles",
                "essential",
                "Thorong La descent is long and hard on knees — poles are strongly recommended.",
            )
        )
        if season == "Winter":
            needs.append(GearNeed("microspikes", "essential", "Thorong La can be icy in winter."))

    if any(k in dest for k in ("mustang", "upper mustang", "lo manthang")):
        needs.append(
            GearNeed(
                "buff",
                "essential",
                "Mustang is windy and dusty — protect mouth, nose, and neck.",
            )
        )
        needs.append(
            GearNeed(
                "sunglasses",
                "essential",
                "Strong glare and dust on the Mustang plateau — quality UV glasses matter.",
            )
        )

    if any(k in dest for k in ("manaslu", "tsum")):
        needs.append(
            GearNeed(
                "power-bank",
                "essential",
                "Manaslu/Tsum charging is limited in remote sections — bring spare power.",
            )
        )

    if experience == "Beginner":
        upgraded = []
        for n in needs:
            if n.slug == "trekking-poles":
                upgraded.append(
                    GearNeed(
                        n.slug,
                        "essential",
                        "Beginners benefit most from poles on steep Nepal descents.",
                    )
                )
            elif n.slug == "power-bank" and n.priority != "essential":
                upgraded.append(
                    GearNeed(
                        n.slug,
                        "essential",
                        "Navigation and emergency calls matter more while you are still learning trails.",
                    )
                )
            else:
                upgraded.append(n)
        needs = upgraded

    if risk == "High" or trek_type == "Hard":
        upgraded = []
        for n in needs:
            if n.slug in {"headlamp", "first-aid-kit", "power-bank"} and n.priority != "essential":
                upgraded.append(
                    GearNeed(
                        n.slug,
                        "essential",
                        n.reason + " Higher risk / harder routes make this critical.",
                    )
                )
            else:
                upgraded.append(n)
        needs = upgraded

    rank = {"essential": 3, "recommended": 2, "optional": 1}
    by_slug: dict[str, GearNeed] = {}
    for need in needs:
        prev = by_slug.get(need.slug)
        if prev is None or rank[need.priority] > rank[prev.priority]:
            by_slug[need.slug] = need
    return list(by_slug.values())


def _match_by_slug(slug: str, gear_items: list[Any]) -> Any | None:
    for gear in gear_items:
        g_slug = getattr(gear, "slug", None) or ""
        if g_slug == slug:
            return gear
    # Fallback: match compacted name to slug words (older DB rows without slug).
    compact_slug = re.sub(r"[^a-z0-9]", "", slug)
    for gear in gear_items:
        name = re.sub(r"[^a-z0-9]", "", (gear.gear_name or "").lower())
        if compact_slug and compact_slug in name:
            return gear
    return None


def recommend_gear_picks(
    db: Any,
    *,
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
    risk: str,
    destination: str | None = None,
) -> list[GearPick]:
    """Return prioritized gear picks matched to the live catalog."""
    import models

    ensure_catalog(db)
    gear_items = db.query(models.Gear).all()
    if not gear_items:
        return []

    needs = build_needs(
        altitude=altitude,
        experience=experience,
        trek_type=trek_type,
        season=season,
        duration=duration,
        risk=risk,
        destination=destination,
    )

    priority_rank = {"essential": 3, "recommended": 2, "optional": 1}
    picks: list[GearPick] = []
    used_ids: set[int] = set()

    for need in sorted(needs, key=lambda n: priority_rank[n.priority], reverse=True):
        gear = _match_by_slug(need.slug, gear_items)
        if gear is None or gear.id in used_ids:
            continue
        used_ids.add(gear.id)
        meta = next((row for row in CATALOG_SEED if row["slug"] == need.slug), {})
        picks.append(
            GearPick(
                gear=gear,
                priority=need.priority,
                reason=need.reason,
                score=priority_rank[need.priority] * 10,
                need_key=need.slug,
                quantity=getattr(gear, "quantity_hint", None) or meta.get("quantity_hint"),
                rent_hint=getattr(gear, "rent_hint", None) or meta.get("rent_hint"),
            )
        )

    picks.sort(key=lambda p: (priority_rank[p.priority], p.score), reverse=True)

    essentials = [p for p in picks if p.priority == "essential"]
    recommended = [p for p in picks if p.priority == "recommended"]
    optional = [p for p in picks if p.priority == "optional"]

    if risk == "Low":
        lim_rec, lim_opt = 8, 3
    elif risk == "Moderate":
        lim_rec, lim_opt = 10, 4
    else:
        lim_rec, lim_opt = 12, 5

    return essentials + recommended[:lim_rec] + optional[:lim_opt]


def packing_lines_from_picks(picks: list[GearPick]) -> list[str]:
    """Human-readable packing list for the trip planner."""
    label = {"essential": "Essential", "recommended": "Recommended", "optional": "Optional"}
    lines: list[str] = []
    for p in picks:
        qty = f" ({p.quantity})" if p.quantity else ""
        rent = f" | {p.rent_hint}" if p.rent_hint else ""
        lines.append(f"{label[p.priority]}: {p.gear.gear_name}{qty} — {p.reason}{rent}")
    return lines


def ams_disclaimer(altitude: int | float) -> str | None:
    if float(altitude) < 3500:
        return None
    return (
        "Altitude illness risk rises above ~3,500 m. TrekPal does not prescribe medicines. "
        "Discuss acetazolamide (Diamox) and ascent plans with a doctor before you go."
    )


def ensure_catalog(db: Any) -> int:
    """Insert or refresh CATALOG_SEED rows. Returns number of rows touched."""
    import models

    existing_by_slug: dict[str, Any] = {}
    existing_by_name: dict[str, Any] = {}
    for g in db.query(models.Gear).all():
        if getattr(g, "slug", None):
            existing_by_slug[g.slug] = g
        existing_by_name[(g.gear_name or "").strip().lower()] = g

    touched = 0
    for row in CATALOG_SEED:
        slug = row["slug"]
        gear = existing_by_slug.get(slug) or existing_by_name.get(row["gear_name"].strip().lower())
        if gear is None:
            # Try fuzzy name match for older short names (e.g. "Hiking Boots").
            for name_key, candidate in existing_by_name.items():
                if slug.replace("-", "")[:8] in re.sub(r"[^a-z0-9]", "", name_key):
                    gear = candidate
                    break

        if gear is None:
            db.add(
                models.Gear(
                    gear_name=row["gear_name"],
                    category=row["category"],
                    description=row["description"],
                    photo_url=None,
                    slug=slug,
                    quantity_hint=row.get("quantity_hint"),
                    rent_hint=row.get("rent_hint"),
                )
            )
            touched += 1
            continue

        changed = False
        if getattr(gear, "slug", None) != slug:
            gear.slug = slug
            changed = True
        if gear.gear_name != row["gear_name"]:
            gear.gear_name = row["gear_name"]
            changed = True
        if gear.category != row["category"]:
            gear.category = row["category"]
            changed = True
        if gear.description != row["description"]:
            gear.description = row["description"]
            changed = True
        if getattr(gear, "quantity_hint", None) != row.get("quantity_hint"):
            gear.quantity_hint = row.get("quantity_hint")
            changed = True
        if getattr(gear, "rent_hint", None) != row.get("rent_hint"):
            gear.rent_hint = row.get("rent_hint")
            changed = True
        if changed:
            touched += 1

    if touched:
        db.commit()
    return touched
