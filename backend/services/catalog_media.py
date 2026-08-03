"""Catalog media path helpers (M9).

Images are static files under frontend/public/catalog and referenced by
site-relative URLs so the Next.js origin can serve them.
"""

CREDIT = "TrekPal catalog illustration"

TREK_IMAGES = {
    "Everest Base Camp": "/catalog/treks/everest-base-camp.svg",
    "Annapurna Circuit": "/catalog/treks/annapurna-circuit.svg",
    "Langtang Valley": "/catalog/treks/langtang-valley.svg",
    "Poon Hill": "/catalog/treks/poon-hill.svg",
    "Manaslu Circuit": "/catalog/treks/manaslu-circuit.svg",
}

CATEGORY_IMAGES = {
    "Footwear": "/catalog/gear/footwear.svg",
    "Clothing": "/catalog/gear/clothing.svg",
    "Accessories": "/catalog/gear/accessories.svg",
    "Camping": "/catalog/gear/camping.svg",
    "Hydration": "/catalog/gear/hydration.svg",
    "Safety": "/catalog/gear/safety.svg",
}


def is_catalog_svg_path(url: str | None, *, folder: str) -> bool:
    if not url:
        return False
    return url.startswith(f"/catalog/{folder}/") and url.endswith(".svg")
