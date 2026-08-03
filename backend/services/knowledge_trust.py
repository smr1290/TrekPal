"""Helpers for honest knowledge-base trust UX."""


def disclaimer_for_category(category: str | None) -> str:
    """Category-specific caution shown on article pages and related UI."""
    key = (category or "").strip().lower()
    if key == "medical":
        return (
            "General education only — not a medical diagnosis or treatment plan. "
            "Seek a clinician for personal advice; descend and get help for worsening altitude symptoms."
        )
    if key == "permit":
        return (
            "Permit rules and fees change. Confirm current requirements with official offices "
            "or a registered agency before you travel."
        )
    if key == "emergency":
        return (
            "Emergency numbers and rescue procedures can change. Confirm locally on arrival "
            "and ensure your insurance covers high-altitude evacuation."
        )
    if key == "safety":
        return (
            "Trail conditions and official advisories change. Check the latest guidance for "
            "your nationality and follow local advice on the trail."
        )
    return (
        "TrekPal guides support preparation. Cross-check critical details (permits, weather, "
        "health) with official sources before you go."
    )


def has_external_source(source_url: str | None) -> bool:
    url = (source_url or "").strip().lower()
    return url.startswith("http://") or url.startswith("https://")
