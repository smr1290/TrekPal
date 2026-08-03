# Phase 2 progress (gym session)

## Done

| ID | Notes |
|----|--------|
| **R1** | `ownership.py`, audit doc, history/trip-plans use shared deps; `/ml` stays unmounted → 404 |
| **R2** | Freeform destination + API validation + migration `013` check constraints |
| **R3** | Planner destination context chip; Treks→Planner thread clearer |
| **R4** | `HEURISTIC_VERSION`, persist factors/version on history + trip plans (`014`) |
| **R5** | 30s idempotency window on prepare + trip-plan generate; fallback source already stored |
| **R6** | Real catalog JPGs + migration `016`; spacing/type tokens; shared empty/loading/error/success states |
| **R7** | Compact mobile nav, map touch vs scroll, chat sticky composer, 16px inputs, tap targets |
| **R8** | Cut button hover flair; loading/saved/delete/chat feedback motion; reduced-motion respected |
| **R9** | History “how we calculated this”; maps “Hidden: unverified…” copy |
| **R10** | Postgres `chat_rate_limits` (`015`) + `allow_chat()`; env `CHAT_RATE_LIMIT_PER_HOUR` |
| **R11** | JSON structured logs around Groq / Open-Meteo |
| **R12** | Signup goal question → treks or dashboard; empty dashboard “First steps” strip |

## Ops still on you

Docker Desktop was off during this session (start was skipped). When back:

```powershell
docker compose up -d --build
docker compose exec -T api alembic upgrade head
# optional: alembic downgrade -1 then upgrade head to prove 016
```

Smoke: signup goal → plan trek → history factors → chat rate limit → treks show photos → phone funnel on /planner /maps /chat.

See also `docs/R6_R8_NOTES.md`.
