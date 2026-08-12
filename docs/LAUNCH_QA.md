# TrekPal Launch QA Gate (S8)

**Rule:** Phase 3 is not complete until this checklist is walked on a **real phone** (not only desktop Chrome) and the results section below is filled in.

| Field | Value |
|-------|--------|
| **Frontend** | https://trek-pal-delta.vercel.app |
| **API** | https://gracious-hope-production-acfe.up.railway.app |
| **Health** | https://gracious-hope-production-acfe.up.railway.app/health/deps |

Use a **mid-range Android or iPhone** on cellular or Wi‑Fi. Run once on a normal network, then repeat critical paths with **throttling** (Chrome DevTools → Network → Slow 3G, or phone Low Data / airplane→Wi‑Fi flicker).

Mark each item **Pass** / **Fail**. On Fail, note the bug and link a fix commit/PR before re-checking.

---

## Pre-flight (any device)

| # | Check | Pass / Fail | Notes |
|---|--------|-------------|-------|
| P1 | `GET /` API returns TrekPal running | ☐ | |
| P2 | `GET /health/deps` shows `"db":{"status":"ok"}` (overall `ok` or `degraded` OK; `unhealthy` = blocker) | ☐ | |
| P3 | Frontend home loads without blank white screen | ☐ | |
| P4 | Footer shows **Privacy** and **Terms** links | ☐ | |

---

## Auth & session

| # | Check | Pass / Fail | Notes |
|---|--------|-------------|-------|
| A1 | **Signup** with a new email succeeds and lands on dashboard (or treks if research goal) | ☐ | |
| A2 | Signup shows Terms + Privacy agreement line | ☐ | |
| A3 | After signup, **refresh** the page — still signed in (cookie session) | ☐ | |
| A4 | **Logout** → protected pages redirect to login | ☐ | |
| A5 | **Login** again → dashboard / me works | ☐ | |
| A6 | After login, **refresh** — still signed in (no “logged out” flash that sticks) | ☐ | |
| A7 | Session is **not** a JWT in `localStorage` (only profile cache `trek_pal_user` OK) | ☐ | DevTools → Application |

---

## Core funnel: Treks → Plan → Checklist

| # | Check | Pass / Fail | Notes |
|---|--------|-------------|-------|
| F1 | `/treks` lists catalog cards | ☐ | |
| F2 | **Plan this trek** opens planner with destination prefilled | ☐ | |
| F3 | **Quick checklist** generates packing results (visual cards OK) | ☐ | |
| F4 | Checklist **saves** — appears under History / My plans | ☐ | |
| F5 | Open a saved checklist detail — risk / gear readable | ☐ | |
| F6 | History item shows explainability (risk factors / heuristic context if present) | ☐ | |

---

## Itinerary + weather

| # | Check | Pass / Fail | Notes |
|---|--------|-------------|-------|
| I1 | Planner **Full itinerary** generates a plan | ☐ | |
| I2 | Badge shows **AI-generated** or **Template fallback (AI unavailable)** — never a raw stack trace | ☐ | |
| I3 | Weather panel loads for a known destination (e.g. Poon Hill / EBC) **or** shows Open-Meteo error with retry + next action | ☐ | |
| I4 | Trust line present (not medical advice / verify before travel / Terms·Privacy) | ☐ | |

---

## Maps trust

| # | Check | Pass / Fail | Notes |
|---|--------|-------------|-------|
| M1 | `/maps` loads map + landmarks | ☐ | |
| M2 | Banner states orientation only / not live rescue; Terms or knowledge links work | ☐ | |
| M3 | Unverified hospital/emergency pins hidden by default | ☐ | |

---

## Chat

| # | Check | Pass / Fail | Notes |
|---|--------|-------------|-------|
| C1 | Signed-in `/chat` accepts a question and returns an answer **or** knowledge fallback (badge), not a 500 / stack trace | ☐ | |
| C2 | Sources link to knowledge articles when present | ☐ | |
| C3 | Trust notice: not medical/legal advice + Terms/Privacy | ☐ | |
| C4 | **Rate limit:** after many asks (or wait for 429), UI shows clear hourly limit message (not a blank failure) | ☐ | Optional if hard to hit; note “deferred” only if API 429 text already verified in code |

---

## Legal (mobile + desktop)

| # | Check | Pass / Fail | Notes |
|---|--------|-------------|-------|
| L1 | Footer → `/privacy` readable on phone | ☐ | |
| L2 | Footer → `/terms` readable on phone | ☐ | |
| L3 | Copy is honest (indie/student; no fake company entity) | ☐ | |

---

## Mobile layout / network

| # | Check | Pass / Fail | Notes |
|---|--------|-------------|-------|
| N1 | Navbar usable; no horizontal page scroll on home / treks / planner | ☐ | |
| N2 | Sticky chat composer usable above keyboard (if tested) | ☐ | |
| N3 | Throttled network: checklist or treks still usable (spinner then content or clear error) | ☐ | |
| N4 | `prefers-reduced-motion` not required to pass; if OS reduce-motion on, no broken UI | ☐ | Optional |

---

## Desktop smoke (optional companion)

Run on a laptop browser if useful; **does not replace** the phone pass.

| # | Check | Pass / Fail | Notes |
|---|--------|-------------|-------|
| D1 | Same funnel as F1–F4 on desktop | ☐ | |
| D2 | Privacy + Terms from footer | ☐ | |

---

## Recorded device passes

> Acceptance requires **at least one** real-device row with overall **Pass** (or Fail items fixed and re-passed).

### Pass 1 — _(fill after walking)_

| Field | Value |
|-------|--------|
| **Date** | YYYY-MM-DD |
| **Device** | e.g. Samsung Axx / iPhone 12, Android 14 / iOS 17 |
| **Browser** | Chrome / Safari |
| **Network** | Wi‑Fi / LTE · normal + throttled? |
| **Tester** | name |
| **Overall** | Pass / Fail |
| **Failed items** | list IDs or “none” |
| **Fix links** | commit/PR URLs if any |

**Notes / screenshots:**

_(paste short notes)_

---

## Pre-check from maintainers (not a phone pass)

| Date | Check | Result |
|------|--------|--------|
| 2026-08-12 | Production `/health/deps` | `status: ok` (db, groq, open_meteo ok) |
| 2026-08-12 | Production API `/` | `TrekPal API Running` |
| 2026-08-12 | Production `/privacy` + `/terms` | HTTP 200 |
| 2026-08-12 | Production `/trek/list` | 54 treks |
| 2026-08-12 | Checklist doc created | This file |

---

## Sign-off

Phase 3 may be marked **complete** only when:

1. Every acceptance checklist item above is **Pass** (or Fail with linked fix and re-Pass).
2. At least one **Recorded device pass** row is filled with Overall **Pass**.
3. `MILESTONES_PRODUCT.md` S8 → Done and Phase 3 note updated.

Until then, S8 stays **Pending**.
