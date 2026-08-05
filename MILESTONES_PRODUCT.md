# TrekPal Product Milestones

## Phase 1 — Foundation (complete)

Shipped quality slices that made TrekPal usable and safer. Kept for history.

| ID | Focus | Status |
|----|--------|--------|
| P1-M1 | Trust & clarity | Done |
| P1-M2 | Treks → Plan trip funnel | Done |
| P1-M3 | Profile: edit experience | Done |
| P1-M4 | My plans: delete | Done |
| P1-M5 | Knowledge trust sources | Done |
| P1-M6 | Maps content curation | Done |
| P1-M7 | httpOnly JWT cookies | Done |
| P1-M8 | API tests + lock `/ml` | Done |
| P1-M9 | Catalog media | Done |
| P1-M10 | Open-Meteo weather on Plan trip | Done |

---

## Phase 2 — Refinement (complete)

Shipped security, IA, heuristics, visual/mobile/motion, trust UX, rate limits, logging, onboarding.

| ID | Focus | Track | Status |
|----|--------|--------|--------|
| **R1** | Auth & ownership hardening | Backend/Security | Done |
| **R2** | Data integrity & migration hygiene | Backend/Engineering | Done |
| **R3** | Goal-based IA audit & funnel rebuild | Frontend/UX | Done |
| **R4** | Heuristic explainability & versioning | Backend/Product-AI | Done |
| **R5** | Trip planner reliability (fallback + idempotency) | Backend/Reliability | Done |
| **R6** | Visual system maturity | Frontend/Design | Done |
| **R7** | Mobile-first correctness | Frontend/UX | Done |
| **R8** | Motion as feedback, not decoration | Frontend/UX | Done |
| **R9** | Trust & safety UX | Frontend/Content | Done |
| **R10** | Durable (Postgres) rate limiting | Backend/Architecture | Done |
| **R11** | Structured logging for Groq / Open-Meteo | Backend/Observability | Done |
| **R12** | First-run experience & goal onboarding | Frontend/UX | Done |

---

## Phase 3 — Ship readiness (active)

**Source of truth for work order:** `.cursor/rules/milestones.mdc` (Milestone 1–8).  
Work **one at a time**. Do not start the next until the current one is confirmed done.

**S1 (2026-08-04):** `docs/PRODUCTION_ENV.md` + `validate_production_config()` refuse weak JWT, `CORS=*`, localhost DB, insecure cookies, and `/ml` without dual override. Tests in `test_production_config.py`.

**S2 (2026-08-05):** Configurable `AUTH_COOKIE_SAMESITE` (prod default `none` for Vercel+API split host; local `lax`). Cookie+CORS matrix + smoke path in `docs/PRODUCTION_ENV.md`. Signup/login → `/auth/me` + `/trek/history` smoke; no JWT in `localStorage`.


Closes the gaps between “strong MVP on your laptop” and “safe to invite real users on the public internet.”

| ID | Focus | Track | Status | Closes gap |
|----|--------|--------|--------|------------|
| **S1** | Production env & secrets hardening | Backend/DevOps | Done | Weak/local secrets leaking to prod |
| **S2** | Production auth cookies (cross-origin) | Backend/Security | Done | Cookies break or weaken off localhost |
| **S3** | Production deploy (API + DB + frontend) | DevOps | Pending | Only runs on one PC |
| **S4** | CI pipeline (tests + build on PR) | Engineering/DevOps | Pending | No automated regression gate |
| **S5** | External AI & weather resilience | Backend/Reliability | Pending | Groq/Open-Meteo outages feel like “app broken” |
| **S6** | Observability (errors + uptime) | Observability | Pending | Failures invisible until a user reports them |
| **S7** | Legal & trust pages | Frontend/Content | Pending | No privacy/terms / launch hygiene |
| **S8** | Launch QA gate (phone + smoke checklist) | QA/Product | Pending | Untested real-device / throttled funnel |

### Why this order

Env + cookies before deploy → deploy before CI proves a real URL → AI resilience + monitoring once strangers can hit the app → legal before wide invite → QA gate as the hard “ship” stop.

### After each Phase 3 milestone

Explain: what changed, files touched, how to verify, trade-offs, what's still not done. Meet the Acceptance bar or say explicitly if you cannot.

**Out of scope for Phase 3** (later phases): trained ML replacing heuristics, deep offline maps, huge catalog photography unique-per-trek, major new product features.
