# TrekPal Production Environment Checklist (Phase 3 / S1)

Use this when promoting TrekPal off your laptop. Local Docker may keep weak
defaults; **production must not**.

The API process calls `validate_production_config()` on startup when
`APP_ENV` is anything other than `development` / `dev` / `test` / `local`.
Bad config → **process exits** with a clear error (see `backend/config.py`).

---

## 1. Required variables (API)

| Variable | Local Docker / uvicorn | Production |
|----------|------------------------|------------|
| `APP_ENV` | `development` | `production` |
| `DATABASE_URL` | `…@localhost…` or Compose `db` host | Hosted Postgres URL (no localhost) |
| `JWT_SECRET` | Placeholder OK | **32+ random chars**, not in the weak list |
| `JWT_ALGORITHM` | `HS256` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Prefer ≤ `1440`; shorter is safer |
| `CORS_ORIGINS` | `http://localhost:3000` | Exact HTTPS frontend origin(s), comma-separated |
| `AUTH_COOKIE_NAME` | `trekpal_access` | Same or your choice |
| `AUTH_COOKIE_SECURE` | unset / `false` (HTTP) | **unset or `true`** (HTTPS) |
| `CHAT_RATE_LIMIT_PER_HOUR` | `20` | `20` or lower |
| `GROQ_API_KEY` | optional | Recommended for chat / AI itinerary |
| `GROQ_MODEL` | default OK | Keep known-good model id |
| `ENABLE_INTERNAL_ML` | unset (on in dev) | **omit or `false`** |
| `ALLOW_INTERNAL_ML_IN_PRODUCTION` | omit | **omit or `false`** unless you really need `/ml` |

## 2. Required variables (frontend)

| Variable | Local | Production |
|----------|-------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Public API HTTPS URL (no trailing slash) |

Copy `frontend/.env.example` → `frontend/.env.local` for local Next.

## 3. Forbidden in production

| Setting | Why |
|---------|-----|
| `JWT_SECRET` short or placeholder (`replace-with-a-long-random-secret`, `secret`, …) | Anyone who knows the default can forge sessions |
| `CORS_ORIGINS=*` | Browsers + credentialed cookies cannot be locked to your app |
| `ENABLE_INTERNAL_ML=true` without `ALLOW_INTERNAL_ML_IN_PRODUCTION=true` | Exposes internal estimate playground |
| `DATABASE_URL` containing `localhost` / `127.0.0.1` | Points at the wrong machine once deployed |
| `AUTH_COOKIE_SECURE=false` | Session cookie can be sent over plain HTTP |
| Committing `backend/.env` or `frontend/.env.local` | Secrets in git history |

## 4. How to generate a JWT secret

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Paste the output into the host’s secret store / env UI — never into a PR.

## 5. Prove the guard works (local)

From `backend/` (with venv active), these must **fail** (non-zero exit / RuntimeError):

```powershell
$env:APP_ENV="production"
$env:JWT_SECRET="short"
$env:CORS_ORIGINS="http://localhost:3000"
$env:DATABASE_URL="postgresql://user:pass@db.example.com:5432/trekpal"
python -c "import importlib; import config; importlib.reload(config)"
```

```powershell
$env:APP_ENV="production"
$env:JWT_SECRET="this-is-a-long-enough-secret-for-tests-012345"
$env:CORS_ORIGINS="*"
$env:DATABASE_URL="postgresql://user:pass@db.example.com:5432/trekpal"
python -c "import importlib; import config; importlib.reload(config)"
```

```powershell
$env:APP_ENV="production"
$env:JWT_SECRET="this-is-a-long-enough-secret-for-tests-012345"
$env:CORS_ORIGINS="https://trekpal.example.com"
$env:DATABASE_URL="postgresql://user:pass@db.example.com:5432/trekpal"
$env:ENABLE_INTERNAL_ML="true"
$env:ALLOW_INTERNAL_ML_IN_PRODUCTION="false"
python -c "import importlib; import config; importlib.reload(config)"
```

Clear the env vars afterward or open a new shell so local `APP_ENV=development` returns.

Automated coverage: `backend/tests/test_production_config.py`.

## 6. Cookie / CORS preview (details in S2)

| Mode | CORS | Cookie `Secure` | Cookie `SameSite` (today) |
|------|------|-----------------|---------------------------|
| Local | `http://localhost:3000` | false | lax (see auth routes) |
| Production split host | `https://your-frontend` | true | document/adjust in S2 |

S1 only **documents** the matrix and enforces Secure + CORS + secrets. Cross-origin cookie tuning is **S2**.

## 7. Checklist before first public deploy

- [ ] `APP_ENV=production`
- [ ] Strong `JWT_SECRET` in host secret store
- [ ] `DATABASE_URL` is hosted Postgres
- [ ] `CORS_ORIGINS` is exact frontend HTTPS origin
- [ ] `AUTH_COOKIE_SECURE` not forced false
- [ ] Internal ML left off
- [ ] `GROQ_API_KEY` set if chat/AI itinerary required
- [ ] `NEXT_PUBLIC_API_URL` matches public API
- [ ] `.env` / `.env.local` not committed (`git status` clean of secrets)
