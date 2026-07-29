"""Structured gear recommendations for Nepal treks.

Why this exists
---------------
The old scorer matched fragile substrings like ``"head lamp"`` / ``"trekking boots"``
against whatever happened to be in the ``gear`` table. Many catalog names never
matched (``Headlamp``, ``Hiking Boots``), so essential kit was often missing.

Approach
--------
1. Define **need slots** (roles): boots, rain shell, down jacket, etc.
2. Each slot has **aliases** that match real catalog names flexibly.
3. Activate slots from altitude / season / duration / difficulty / experience / risk.
4. Map each active slot to the best catalog row; return priority + human reason.

Alternatives considered
-----------------------
- Pure LLM packing lists: flexible but inconsistent and hard to test.
- Tags column on every gear row: cleaner long-term; slots + aliases work without a
  schema redesign and still match today's catalog.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Literal

Priority = Literal["essential", "recommended", "optional"]


@dataclass(frozen=True)
class GearNeed:
    """One role the trekker should fill in their pack."""

    key: str
    aliases: tuple[str, ...]
    priority: Priority
    reason: str
    # Prefer these categories when several catalog rows match.
    preferred_categories: tuple[str, ...] = ()


@dataclass
class GearPick:
    gear: Any
    priority: Priority
    reason: str
    score: int
    need_key: str


# Seed inventory used by migration + ensure_catalog(). Safe to re-run (name unique).
CATALOG_SEED: list[dict[str, str]] = [
    {
        "gear_name": "Hiking Boots",
        "category": "Footwear",
        "description": "Broken-in waterproof mid-cut boots for rocky trails.",
    },
    {
        "gear_name": "Camp Sandals",
        "category": "Footwear",
        "description": "Light sandals for evenings and river crossings.",
    },
    {
        "gear_name": "Trekking Socks",
        "category": "Footwear",
        "description": "Moisture-wicking socks; pack several pairs for multi-day treks.",
    },
    {
        "gear_name": "Down Jacket",
        "category": "Clothing",
        "description": "Insulated jacket for cold mornings and high camps.",
    },
    {
        "gear_name": "Fleece Midlayer",
        "category": "Clothing",
        "description": "Warm midlayer for hiking and evenings in lodges.",
    },
    {
        "gear_name": "Thermal Base Layer",
        "category": "Clothing",
        "description": "Moisture-wicking base layer for cold altitude nights.",
    },
    {
        "gear_name": "Rain Jacket",
        "category": "Clothing",
        "description": "Waterproof breathable shell for monsoon and afternoon storms.",
    },
    {
        "gear_name": "Rain Poncho",
        "category": "Clothing",
        "description": "Lightweight rain protection that covers pack and body.",
    },
    {
        "gear_name": "Warm Gloves",
        "category": "Clothing",
        "description": "Insulated gloves for cold passes and early starts.",
    },
    {
        "gear_name": "Sun Hat",
        "category": "Clothing",
        "description": "Wide-brim or cap for strong high-altitude UV.",
    },
    {
        "gear_name": "Trekking Backpack 50L",
        "category": "Accessories",
        "description": "50–65L pack sized for teahouse multi-day treks.",
    },
    {
        "gear_name": "Trekking Poles",
        "category": "Accessories",
        "description": "Adjustable poles that reduce knee load on descents.",
    },
    {
        "gear_name": "Sleeping Bag -10C",
        "category": "Camping",
        "description": "Cold-weather bag for high teahouse nights.",
    },
    {
        "gear_name": "Water Bottle 1L",
        "category": "Hydration",
        "description": "Durable bottle; carry at least 1–2L capacity.",
    },
    {
        "gear_name": "Water Purification Tablets",
        "category": "Hydration",
        "description": "Treat lodge or stream water when bottled water is scarce.",
    },
    {
        "gear_name": "Headlamp",
        "category": "Safety",
        "description": "Hands-free light for pre-dawn starts and lodge nights.",
    },
    {
        "gear_name": "First Aid Kit",
        "category": "Safety",
        "description": "Blister care, pain relief, antiseptic, personal meds.",
    },
    {
        "gear_name": "Sunglasses",
        "category": "Accessories",
        "description": "UV protection; critical on snow and above 3,000 m.",
    },
    {
        "gear_name": "Sunscreen SPF 50",
        "category": "Accessories",
        "description": "High SPF for intense Himalayan UV reflection.",
    },
    {
        "gear_name": "Power Bank",
        "category": "Accessories",
        "description": "Lodge charging is unreliable; keep devices alive for maps/SOS.",
    },
    {
        "gear_name": "Gaiters",
        "category": "Accessories",
        "description": "Keep snow, mud, and scree out of boots.",
    },
    {
        "gear_name": "Microspikes",
        "category": "Accessories",
        "description": "Traction for icy trails in winter or high passes.",
    },
    {
        "gear_name": "Buff Neck Gaiter",
        "category": "Clothing",
        "description": "Dust, wind, and sun protection for the face and neck.",
    },
]


def _compact(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (text or "").lower())


def _name_matches(gear_name: str, aliases: tuple[str, ...]) -> bool:
    name = (gear_name or "").lower()
    compact_name = _compact(gear_name)
    for alias in aliases:
        a = alias.lower().strip()
        if not a:
            continue
        if a in name:
            return True
        if _compact(a) and _compact(a) in compact_name:
            return True
        # All significant words from the alias appear in the name.
        words = [w for w in re.findall(r"[a-z0-9]+", a) if len(w) > 2]
        if words and all(w in name for w in words):
            return True
    return False


def build_needs(
    *,
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
    risk: str,
) -> list[GearNeed]:
    """Decide which gear roles matter for this trip profile."""
    alt = float(altitude)
    days = float(duration)
    needs: list[GearNeed] = [
        GearNeed(
            key="boots",
            aliases=("hiking boots", "trekking boots", "boots"),
            priority="essential",
            reason="Broken-in waterproof boots prevent blisters and slips on rocky trails.",
            preferred_categories=("Footwear",),
        ),
        GearNeed(
            key="backpack",
            aliases=("backpack", "trekking pack", "rucksack"),
            priority="essential",
            reason="A 50–65L pack fits teahouse multi-day clothing and layers.",
            preferred_categories=("Accessories",),
        ),
        GearNeed(
            key="water",
            aliases=("water bottle", "bottle", "hydration"),
            priority="essential",
            reason="Reliable hydration capacity every day on trail.",
            preferred_categories=("Hydration",),
        ),
        GearNeed(
            key="first_aid",
            aliases=("first aid", "first-aid", "medical kit"),
            priority="essential",
            reason="Blisters and minor injuries are common; carry a basic kit.",
            preferred_categories=("Safety",),
        ),
        GearNeed(
            key="headlamp",
            aliases=("headlamp", "head lamp", "torch", "flashlight"),
            priority="essential",
            reason="Early starts and dark lodges need hands-free light.",
            preferred_categories=("Safety",),
        ),
        GearNeed(
            key="rain",
            aliases=("rain jacket", "rain shell", "rain poncho", "poncho", "waterproof"),
            priority="essential",
            reason="Afternoon storms are common in the hills; stay dry to stay warm.",
            preferred_categories=("Clothing",),
        ),
        GearNeed(
            key="sunscreen",
            aliases=("sunscreen", "spf", "sun cream"),
            priority="essential",
            reason="UV is intense at altitude even on cloudy days.",
            preferred_categories=("Accessories",),
        ),
        GearNeed(
            key="sun_hat",
            aliases=("sun hat", "hat", "cap"),
            priority="recommended",
            reason="Shade your face and neck during long exposed climbs.",
            preferred_categories=("Clothing",),
        ),
        GearNeed(
            key="fleece",
            aliases=("fleece", "midlayer", "mid layer"),
            priority="recommended",
            reason="A breathable midlayer works for hiking and cool evenings.",
            preferred_categories=("Clothing",),
        ),
        GearNeed(
            key="poles",
            aliases=("trekking poles", "hiking poles", "poles"),
            priority="recommended",
            reason="Poles save knees on long Himalayan descents.",
            preferred_categories=("Accessories",),
        ),
        GearNeed(
            key="buff",
            aliases=("buff", "neck gaiter", "neck warmer"),
            priority="optional",
            reason="Useful for dust, cold wind, and sun on open ridges.",
            preferred_categories=("Clothing",),
        ),
    ]

    if alt >= 3000:
        needs.append(
            GearNeed(
                key="sunglasses",
                aliases=("sunglasses", "glacier glasses", "sun glasses"),
                priority="essential",
                reason="Strong UV and snow glare above ~3,000 m can damage eyes.",
                preferred_categories=("Accessories",),
            )
        )
        needs.append(
            GearNeed(
                key="socks",
                aliases=("socks", "trekking socks", "extra socks"),
                priority="recommended",
                reason="Dry socks prevent blisters and cold feet at altitude.",
                preferred_categories=("Footwear",),
            )
        )

    if alt >= 3500 or season == "Winter":
        needs.append(
            GearNeed(
                key="down_jacket",
                aliases=("down jacket", "puffer", "insulated jacket"),
                priority="essential",
                reason="High camps and early mornings get cold fast; insulation is non-negotiable.",
                preferred_categories=("Clothing",),
            )
        )

    if alt >= 4000 or season == "Winter":
        needs.append(
            GearNeed(
                key="thermals",
                aliases=("thermal", "base layer", "baselayer"),
                priority="essential",
                reason="Base layers keep you warm when temperatures drop at night.",
                preferred_categories=("Clothing",),
            )
        )
        needs.append(
            GearNeed(
                key="gloves",
                aliases=("gloves", "mittens"),
                priority="essential" if season == "Winter" or alt >= 4500 else "recommended",
                reason="Cold fingers reduce grip and safety on poles and ladders.",
                preferred_categories=("Clothing",),
            )
        )
        needs.append(
            GearNeed(
                key="sleeping_bag",
                aliases=("sleeping bag", "sleep bag"),
                priority="essential",
                reason="Teahouse blankets vary; bring a bag rated for expected night temps.",
                preferred_categories=("Camping",),
            )
        )

    if alt >= 4500 or season == "Winter" or (trek_type == "Hard" and alt >= 4000):
        needs.append(
            GearNeed(
                key="gaiters",
                aliases=("gaiters",),
                priority="recommended" if season != "Winter" else "essential",
                reason="Keep snow and scree out of boots on high or winter trails.",
                preferred_categories=("Accessories",),
            )
        )

    if season == "Winter" or (alt >= 4800 and season in {"Autumn", "Spring"}):
        needs.append(
            GearNeed(
                key="traction",
                aliases=("microspikes", "crampons", "spikes"),
                priority="recommended" if season == "Winter" else "optional",
                reason="Icy sections appear on high passes — traction prevents slips.",
                preferred_categories=("Accessories",),
            )
        )

    if days >= 4:
        needs.append(
            GearNeed(
                key="power_bank",
                aliases=("power bank", "powerbank", "battery pack"),
                priority="recommended",
                reason="Lodge charging is slow or paid; keep phone/maps powered.",
                preferred_categories=("Accessories",),
            )
        )
        needs.append(
            GearNeed(
                key="water_treatment",
                aliases=("purification", "water tablets", "filter", "steripen"),
                priority="recommended",
                reason="Treating water is cheaper and more reliable than buying bottles daily.",
                preferred_categories=("Hydration",),
            )
        )

    if days >= 7:
        needs.append(
            GearNeed(
                key="sandals",
                aliases=("sandals", "camp shoes", "flip flop"),
                priority="recommended",
                reason="Give feet a rest in lodges after long days in boots.",
                preferred_categories=("Footwear",),
            )
        )
        # Promote socks if not already added.
        if not any(n.key == "socks" for n in needs):
            needs.append(
                GearNeed(
                    key="socks",
                    aliases=("socks", "trekking socks", "extra socks"),
                    priority="recommended",
                    reason="Multi-day treks need spare socks while others dry.",
                    preferred_categories=("Footwear",),
                )
            )

    if experience == "Beginner":
        # Upgrade poles and first-aid messaging already essential; add poles boost via duplicate skip.
        for i, n in enumerate(needs):
            if n.key == "poles":
                needs[i] = GearNeed(
                    key=n.key,
                    aliases=n.aliases,
                    priority="essential",
                    reason="Beginners benefit most from poles on steep Nepal descents.",
                    preferred_categories=n.preferred_categories,
                )
            if n.key == "power_bank" and n.priority == "recommended":
                needs[i] = GearNeed(
                    key=n.key,
                    aliases=n.aliases,
                    priority="essential",
                    reason="Navigation and emergency calls matter more when you are still learning the trails.",
                    preferred_categories=n.preferred_categories,
                )

    if risk == "High" or trek_type == "Hard":
        for i, n in enumerate(needs):
            if n.key in {"headlamp", "first_aid", "power_bank"} and n.priority != "essential":
                needs[i] = GearNeed(
                    key=n.key,
                    aliases=n.aliases,
                    priority="essential",
                    reason=n.reason + " Higher risk / harder routes make this critical.",
                    preferred_categories=n.preferred_categories,
                )

    # De-duplicate by key, keeping the higher priority if both appear.
    rank = {"essential": 3, "recommended": 2, "optional": 1}
    by_key: dict[str, GearNeed] = {}
    for need in needs:
        prev = by_key.get(need.key)
        if prev is None or rank[need.priority] > rank[prev.priority]:
            by_key[need.key] = need
    return list(by_key.values())


def _match_catalog(need: GearNeed, gear_items: list[Any]) -> Any | None:
    matches: list[tuple[int, Any]] = []
    for gear in gear_items:
        name = gear.gear_name or ""
        if not _name_matches(name, need.aliases):
            continue
        score = 10
        cat = (gear.category or "").strip()
        if need.preferred_categories and cat in need.preferred_categories:
            score += 5
        # Prefer earlier aliases (more specific) when several catalog rows match.
        for index, alias in enumerate(need.aliases):
            if _name_matches(name, (alias,)):
                score += max(0, 20 - index)
                break
        # Prefer concise product names slightly.
        score += max(0, 8 - len(name.split()))
        matches.append((score, gear))
    if not matches:
        return None
    matches.sort(key=lambda x: x[0], reverse=True)
    return matches[0][1]


def recommend_gear_picks(
    db: Any,
    *,
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
    risk: str,
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
    )

    priority_rank = {"essential": 3, "recommended": 2, "optional": 1}
    picks: list[GearPick] = []
    used_ids: set[int] = set()

    for need in sorted(needs, key=lambda n: priority_rank[n.priority], reverse=True):
        gear = _match_catalog(need, gear_items)
        if gear is None or gear.id in used_ids:
            continue
        used_ids.add(gear.id)
        picks.append(
            GearPick(
                gear=gear,
                priority=need.priority,
                reason=need.reason,
                score=priority_rank[need.priority] * 10,
                need_key=need.key,
            )
        )

    picks.sort(key=lambda p: (priority_rank[p.priority], p.score), reverse=True)

    # Soft limit so the UI stays readable; never drop essentials.
    essentials = [p for p in picks if p.priority == "essential"]
    recommended = [p for p in picks if p.priority == "recommended"]
    optional = [p for p in picks if p.priority == "optional"]

    if risk == "Low":
        lim_rec, lim_opt = 6, 2
    elif risk == "Moderate":
        lim_rec, lim_opt = 8, 3
    else:
        lim_rec, lim_opt = 10, 4

    return essentials + recommended[:lim_rec] + optional[:lim_opt]


def packing_lines_from_picks(picks: list[GearPick]) -> list[str]:
    """Human-readable packing list for the trip planner."""
    label = {"essential": "Essential", "recommended": "Recommended", "optional": "Optional"}
    return [f"{label[p.priority]}: {p.gear.gear_name} — {p.reason}" for p in picks]


def ensure_catalog(db: Any) -> int:
    """Insert missing CATALOG_SEED rows. Returns number of rows added."""
    import models

    existing = {
        (g.gear_name or "").strip().lower()
        for g in db.query(models.Gear).all()
    }
    added = 0
    for row in CATALOG_SEED:
        key = row["gear_name"].strip().lower()
        if key in existing:
            continue
        db.add(
            models.Gear(
                gear_name=row["gear_name"],
                category=row["category"],
                description=row["description"],
                photo_url=None,
            )
        )
        existing.add(key)
        added += 1
    if added:
        db.commit()
    return added
