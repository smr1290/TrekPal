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

## Phase 2 — Refinement (active)

**Source of truth for work order:** `.cursor/rules/milestones.mdc` (Milestone 1–12 below).  
Work **one at a time**. Do not start the next until the current one is confirmed done.

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

### Why this order

Security and data integrity first → IA and heuristic explainability → visual/mobile/motion → trust UX (needs R4+R5) → rate limit, logging, onboarding.

### Goal lens (every screen)

| Page | User's real goal |
|------|------------------|
| Home | “Is this trustworthy enough to give my email to?” |
| Treks | “Which trek fits my skill/time/season?” |
| Planner | “Am I actually ready, concretely?” |
| History | “Can I get back into my plan without re-thinking it?” |
| Knowledge | “Can I trust this specific fact before I act on it?” |
| Maps | “Where am I relative to real landmarks, without false safety confidence?” |

### After each Phase 2 milestone

Explain: what changed, files touched, how to verify, trade-offs, what's still not done. Meet the Acceptance bar or say explicitly if you cannot.

**Phase 2 status (2026-08-04):** R1–R12 shipped. Live DB verified at Alembic `016_catalog_photography` (downgrade `-1` + upgrade head OK). `/trek/list` returns `.jpg` catalog URLs. Frontend at `localhost:3000`, API at `localhost:8000`.

**Phase 3:** not defined yet — pick a track below (or write new milestones into `.cursor/rules/milestones.mdc`).
