from pathlib import Path

root = Path(__file__).resolve().parents[1] / "frontend" / "public" / "catalog"
(root / "treks").mkdir(parents=True, exist_ok=True)
(root / "gear").mkdir(parents=True, exist_ok=True)


def trek_svg(bg1: str, bg2: str, label: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" role="img" aria-label="{label}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{bg1}"/>
      <stop offset="100%" stop-color="{bg2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="480" fill="url(#sky)"/>
  <path d="M0 340 L160 210 L250 300 L360 160 L480 280 L580 200 L700 290 L800 240 L800 480 L0 480 Z" fill="#f8fafc" opacity="0.92"/>
  <path d="M0 380 L120 300 L220 360 L340 250 L460 350 L600 280 L800 360 L800 480 L0 480 Z" fill="#0f172a" opacity="0.22"/>
  <circle cx="640" cy="110" r="36" fill="#fff7ed" opacity="0.85"/>
</svg>
"""


def gear_svg(color: str, icons: str, label: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-label="{label}">
  <rect width="640" height="400" fill="#f4f7f5"/>
  <rect x="40" y="40" width="560" height="320" rx="28" fill="{color}" opacity="0.15"/>
  <g fill="{color}" transform="translate(220 110) scale(1.4)">{icons}</g>
</svg>
"""


treks = {
    "everest-base-camp.svg": ("#1e3a5f", "#7dd3fc", "Everest Base Camp"),
    "annapurna-circuit.svg": ("#3f2a1d", "#f59e0b", "Annapurna Circuit"),
    "langtang-valley.svg": ("#14532d", "#86efac", "Langtang Valley"),
    "poon-hill.svg": ("#7c2d12", "#fdba74", "Poon Hill"),
    "manaslu-circuit.svg": ("#1e1b4b", "#a5b4fc", "Manaslu Circuit"),
}

gears = {
    "footwear.svg": (
        "#0f766e",
        '<path d="M20 90c20-40 60-50 100-40 20 5 40 10 55 25v20c-25-5-45-5-70 5-20 8-40 15-60 10z"/><path d="M35 95h95v12H35z" opacity="0.35"/>',
        "Footwear",
    ),
    "clothing.svg": (
        "#b45309",
        '<path d="M70 30l30-15 30 15 25-10 20 25-25 15v55H75V60L50 45z"/>',
        "Clothing",
    ),
    "accessories.svg": (
        "#1d4ed8",
        '<rect x="55" y="25" width="70" height="90" rx="12"/><circle cx="90" cy="55" r="10" fill="#f4f7f5"/>',
        "Accessories",
    ),
    "camping.svg": (
        "#334155",
        '<path d="M90 20 L140 110 H40 Z"/><rect x="78" y="95" width="24" height="20"/>',
        "Camping",
    ),
    "hydration.svg": (
        "#0284c7",
        '<path d="M75 25h30v20h10v85c0 12-10 22-25 22s-25-10-25-22V45h10z"/>',
        "Hydration",
    ),
    "safety.svg": (
        "#b91c1c",
        '<path d="M90 20c30 12 50 18 50 45 0 40-35 65-50 75-15-10-50-35-50-75 0-27 20-33 50-45z"/>',
        "Safety",
    ),
}

for name, (a, b, label) in treks.items():
    (root / "treks" / name).write_text(trek_svg(a, b, label), encoding="utf-8")

for name, (color, icons, label) in gears.items():
    (root / "gear" / name).write_text(gear_svg(color, icons, label), encoding="utf-8")

print(f"wrote {len(treks)} trek + {len(gears)} gear SVGs to {root}")
