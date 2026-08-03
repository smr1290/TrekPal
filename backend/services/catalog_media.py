"""Catalog media path helpers.

Images are static files under frontend/public/catalog and referenced by
site-relative URLs so the Next.js origin can serve them.
"""

CREDIT = "Photo via Unsplash (catalog)"

TREK_IMAGES = {
    "Everest Base Camp": "/catalog/treks/everest-base-camp.jpg",
    "Annapurna Circuit": "/catalog/treks/annapurna-circuit.jpg",
    "Langtang Valley": "/catalog/treks/langtang-valley.jpg",
    "Poon Hill": "/catalog/treks/poon-hill.jpg",
    "Manaslu Circuit": "/catalog/treks/manaslu-circuit.jpg",
}

CATEGORY_IMAGES = {
    "Footwear": "/catalog/gear/footwear.jpg",
    "Clothing": "/catalog/gear/clothing.jpg",
    "Accessories": "/catalog/gear/accessories.jpg",
    "Camping": "/catalog/gear/camping.jpg",
    "Hydration": "/catalog/gear/hydration.jpg",
    "Safety": "/catalog/gear/safety.jpg",
}

_MEDIA_EXT = (".jpg", ".jpeg", ".webp", ".png")


def is_catalog_media_path(url: str | None, *, folder: str) -> bool:
    if not url:
        return False
    return url.startswith(f"/catalog/{folder}/") and url.lower().endswith(_MEDIA_EXT)


def is_catalog_svg_path(url: str | None, *, folder: str) -> bool:
    """Deprecated alias — catalog now uses photography, not SVG placeholders."""
    return is_catalog_media_path(url, folder=folder)
