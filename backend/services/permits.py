"""Route-aware Nepal permit guidance.

TIMS and park rules differ by region and by traveler type (Nepali citizen vs foreign visitor).
Fees and exact office locations change — always verify before travel.
"""

from __future__ import annotations

# (destination keywords, foreign permits, nepali notes)
ROUTE_PERMITS: list[tuple[tuple[str, ...], list[str], list[str]]] = [
    (
        ("everest base camp", "ebc", "gokyo", "khumbu", "sagarmatha"),
        [
            "TIMS card (Trekkers' Information Management System) for foreign trekkers.",
            "Sagarmatha National Park entry permit (SNP).",
            "Local rural municipality / Khumbu fees may apply — confirm in Lukla or Kathmandu.",
            "Carry passport + permit copies; checkpoints check documents regularly.",
        ],
        [
            "Nepali citizens generally do not need TIMS (that is for foreign trekkers).",
            "Sagarmatha National Park / local entry tickets may still apply at citizen rates — confirm current fees.",
            "Carry citizenship card / national ID; some posts ask for it.",
        ],
    ),
    (
        ("annapurna base camp", "abc", "annapurna sanctuary", "ghorepani", "poon hill"),
        [
            "TIMS card for foreign trekkers.",
            "Annapurna Conservation Area Permit (ACAP).",
            "Buy ACAP/TIMS in Kathmandu or Pokhara before the trail when possible.",
        ],
        [
            "Nepali citizens generally do not need TIMS.",
            "ACAP / conservation entry may still apply at citizen rates — confirm before entry.",
            "Carry citizenship / national ID.",
        ],
    ),
    (
        ("annapurna circuit", "thorong", "manang", "mustang gate"),
        [
            "TIMS card for foreign trekkers.",
            "Annapurna Conservation Area Permit (ACAP).",
            "If continuing into Upper Mustang, you also need a Restricted Area Permit (RAP) — see Mustang rules.",
        ],
        [
            "Nepali citizens generally do not need TIMS.",
            "ACAP entry may still apply — confirm citizen process/fees.",
            "Upper Mustang has additional restricted-area rules even for citizens — verify current policy.",
        ],
    ),
    (
        ("upper mustang", "lo manthang", "mustang"),
        [
            "Restricted Area Permit (RAP) for Upper Mustang (foreign trekkers) — usually arranged via registered agency.",
            "Annapurna Conservation Area Permit (ACAP) is typically also required.",
            "TIMS may still be required depending on current rules — confirm with agency/TAAN.",
            "Independent trekking rules are stricter here — plan permits early.",
        ],
        [
            "Upper Mustang has special/restricted access rules — confirm current citizen requirements before travel.",
            "ACAP or local conservation tickets may apply.",
            "Carry citizenship / national ID and any local letters required by posts.",
        ],
    ),
    (
        ("manaslu", "tsum"),
        [
            "Manaslu Conservation Area Permit (MCAP) and/or restricted-area permits — usually via registered agency.",
            "TIMS card for foreign trekkers (confirm current pairing with MCAP).",
            "Manaslu Circuit is typically agency-supported for permit logistics.",
        ],
        [
            "Confirm Manaslu / Tsum conservation or restricted-area entry rules for Nepali citizens.",
            "Carry citizenship / national ID.",
            "Remote checkpoints may ask for local paperwork — check before departure.",
        ],
    ),
    (
        ("langtang", "gosaikunda", "helambu"),
        [
            "TIMS card for foreign trekkers.",
            "Langtang National Park entry permit (or relevant park/conservation fee).",
        ],
        [
            "Nepali citizens generally do not need TIMS.",
            "Langtang National Park / local entry may apply at citizen rates.",
            "Carry citizenship / national ID.",
        ],
    ),
]


def permits_for_route(traveler_type: str, destination: str) -> list[str]:
    """Return concrete permit checklist for a destination + traveler type."""
    dest = (destination or "").strip().lower()
    traveler = (traveler_type or "foreign").strip().lower()
    is_nepali = traveler in {"nepali", "nepal", "local", "citizen", "nepalese"}

    matched: list[str] | None = None
    for keywords, foreign, nepali in ROUTE_PERMITS:
        if any(k in dest for k in keywords):
            matched = nepali if is_nepali else foreign
            break

    if matched is None:
        if is_nepali:
            matched = [
                "Nepali citizens generally do not need a TIMS card (usually for foreign trekkers).",
                f"You may still need a national park / conservation area entry ticket for {destination or 'your route'} — confirm citizen rates.",
                "Carry citizenship card / national ID for checkpoints.",
            ]
        else:
            matched = [
                "TIMS card is usually required for foreign trekkers on popular routes.",
                f"Buy the relevant national park / conservation permit for {destination or 'your route'} (e.g. SNP, ACAP, Langtang NP).",
                "Restricted areas (Upper Mustang, Manaslu, etc.) need extra permits — often via a registered agency.",
                "Carry passport + permit copies on the trail.",
            ]

    footer = [
        "Permit fees and office locations change — verify with the Department of Tourism, park office, or a licensed agency before you go.",
        "TrekPal guidance is informational, not an official government source.",
    ]
    return [*matched, *footer]
