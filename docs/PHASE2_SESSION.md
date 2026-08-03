# Phase 2 progress (gym session)

## Done

| ID | Notes |
|----|--------|
| **R1** | `ownership.py`, audit doc, history/trip-plans use shared deps; `/ml` stays unmounted → 404 |
| **R2** | Freeform destination + API validation + migration `013` check constraints. Live alembic up/down not run (Docker Desktop was off) |
| **R3** | Planner destination context chip; Treks→Planner thread clearer |
| **R4** | `HEURISTIC_VERSION`, persist factors/version on history + trip plans (`014`) |
| **R5** | 30s idempotency window on prepare + trip-plan generate; fallback source already stored; structured fallback log |
| **R9** | History “how we calculated this”; maps “Hidden: unverified…” copy |
| **R10** | Postgres `chat_rate_limits` (`015`) + `allow_chat()`; env `CHAT_RATE_LIMIT_PER_HOUR` |
| **R11** | JSON structured logs around Groq / Open-Meteo |
| **R12** | Signup goal question → treks or dashboard; empty dashboard “First steps” strip |

## Partial / deferred

| ID | Why |
|----|-----|
| **R6** | Tokens/states already strong; real photography + full screenshot audit needs assets + Docker |
| **R7** | Input font ≥16px set; full real-phone funnel pass still needed |
| **R8** | Button motion + reduced-motion already exist; full flair audit incomplete |

## When you’re back

1. Start Docker Desktop  
2. `docker compose up -d --build`  
3. `docker compose exec -T api alembic upgrade head`  
4. Smoke: signup goal → plan trek → history factors → chat rate limit  
5. Optional: finish R6 photography / R7 phone pass / R8 motion audit  
