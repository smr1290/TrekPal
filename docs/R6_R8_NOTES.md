# R6–R8 visual / mobile / motion notes

## R6 — Visual system maturity

| Change | Detail |
|--------|--------|
| Real photography | JPG assets under `frontend/public/catalog/treks` and `…/gear` (Unsplash). Migration `016` points DB URLs at `.jpg`. |
| Design tokens | Spacing (`--space-*`) and type (`--text-*`, `--leading-*`) in `globals.css`. |
| Shared states | `.state-error` / `.state-success`; Input disabled + invalid; Card focus-visible when interactive; LoadingBlock uses skeleton shimmer. |
| Screenshot audit (dev) | Empty / loading / error / populated covered by EmptyState, Skeleton*, ErrorBanner, SuccessBanner, WeatherPanel error styling. |

**Still not a full device screenshot pack** — that needs a local browser pass after Docker is up. Assets and tokens are in place.

## R7 — Mobile-first

| Change | Detail |
|--------|--------|
| Inputs | `.field-control` stays `font-size: 1rem` (no iOS zoom). |
| Nav | Shorter bar on small screens (`h-14` / `pt-14`); larger hamburger tap target. |
| Maps | Wheel zoom desktop-only; touch zoom kept; `.map-touch-shell` contains overscroll. |
| Chat | Sticky composer + safe-area padding; scrollable thread on phone. |
| Taps | `--tap-min` (~44px) on buttons/chips. |

**Acceptance caveat:** full “real mid-range Android over throttled network” pass still needs your phone once the stack is running.

## R8 — Motion as feedback

| Change | Detail |
|--------|--------|
| Cut flair | Removed Button hover-scale and shine sweep; tap scale kept as press feedback. |
| Added feedback | Button `loading` spinner; planner “Plan saved” banner; history delete exit animation; chat message enter. |
| Reduced motion | Reveals / exits / tap scale respect `prefers-reduced-motion`; CSS hovers disabled under the media query. |

**Acceptance caveat:** disable motion in OS settings and re-walk funnel after Docker is up.
