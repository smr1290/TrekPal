# TrekPal Production Environment Checklist (Phase 3 / S1–S2)

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
| `AUTH_COOKIE_SAMESITE` | unset → `lax` | unset → `none` (split host); or `lax` if FE+API same site |
| `CHAT_RATE_LIMIT_PER_HOUR` | `20` | `20` or lower |
| `GROQ_API_KEY` | optional | Recommended for chat / AI itinerary |
| `GROQ_MODEL` | default OK | Keep known-good model id |
| `SENTRY_DSN` | omit | Optional — Sentry error tracking (see `docs/OBSERVABILITY.md`) |
| `ENABLE_OBSERVABILITY_TEST_ROUTES` | omit / `false` | **`true` only briefly** to verify Sentry via `/health/test-error` |
| `ENABLE_INTERNAL_ML` | unset (on in dev) | **omit or `false`** |
| `ALLOW_INTERNAL_ML_IN_PRODUCTION` | omit | **omit or `false`** unless you really need `/ml` |

## 2. Required variables (frontend)

| Variable | Local | Production |
|----------|-------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | `/backend` (with `API_PROXY_TARGET` set to the Railway URL) |
| `API_PROXY_TARGET` | omit | Railway API HTTPS URL (no trailing slash) |
| `NEXT_PUBLIC_SENTRY_DSN` | omit | Optional Sentry DSN for client errors (`docs/OBSERVABILITY.md`) |

Copy `frontend/.env.example` → `frontend/.env.local` for local Next.

Frontend auth rules (S2):

- Every authenticated `fetch` uses `credentials: 'include'` (`frontend/lib/api.ts`).
- Session lives in the **httpOnly** cookie `trekpal_access` — **never** in `localStorage`.
- `localStorage` key `trek_pal_user` holds **profile UI cache only** (`id`, name, experience).
- Legacy JWT key is cleared on load if present.

## 3. Forbidden in production

| Setting | Why |
|---------|-----|
| `JWT_SECRET` short or placeholder (`replace-with-a-long-random-secret`, `secret`, …) | Anyone who knows the default can forge sessions |
| `CORS_ORIGINS=*` | Browsers + credentialed cookies cannot be locked to your app |
| `ENABLE_INTERNAL_ML=true` without `ALLOW_INTERNAL_ML_IN_PRODUCTION=true` | Exposes internal estimate playground |
| `DATABASE_URL` containing `localhost` / `127.0.0.1` | Points at the wrong machine once deployed |
| `AUTH_COOKIE_SECURE=false` | Session cookie can be sent over plain HTTP |
| `AUTH_COOKIE_SAMESITE=none` with Secure off | Browsers reject / ignore the cookie |
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

---

## 6. Cookie + CORS matrix (S2)

TrekPal’s intended first public topology is **split host**:

- Frontend: `https://….vercel.app` (or custom domain)
- API: `https://….up.railway.app` / Render / similar

Those are **different sites**. A normal `fetch` from the frontend is a **cross-site** request. Browsers only attach cookies on those requests when:

1. Cookie has `SameSite=None`
2. Cookie has `Secure` (HTTPS)
3. Cookie has `HttpOnly` (TrekPal always sets this — JS cannot read the JWT)
4. API CORS allows the **exact** frontend origin and `allow_credentials=True`
5. Frontend calls use `credentials: 'include'`

### Matrix

| Topology | Example | `CORS_ORIGINS` | `Secure` | `SameSite` | Why |
|----------|---------|----------------|----------|------------|-----|
| Local Docker / uvicorn | `localhost:3000` → `localhost:8000` | `http://localhost:3000` | `false` | `lax` (default) | Same site (localhost); HTTP cannot use Secure |
| Production **split host** (default) | Vercel FE + Railway API | `https://your-frontend` | `true` | `none` (default) | Cross-site XHR needs None+Secure |
| Production **same site** | `app.example.com` + `api.example.com` behind one eTLD+1 *or* reverse-proxy same origin | Exact FE origin | `true` | `lax` (set explicitly) | Lax is stricter; use when cookies are same-site |

### Cookie flags TrekPal sets

| Flag | Value | Purpose |
|------|-------|---------|
| Name | `trekpal_access` (or `AUTH_COOKIE_NAME`) | Session JWT |
| `HttpOnly` | always `true` | XSS cannot steal token via `document.cookie` |
| `Secure` | from `AUTH_COOKIE_SECURE` / prod default | HTTPS only |
| `SameSite` | from `AUTH_COOKIE_SAMESITE` / defaults above | Cross-site vs same-site |
| `Path` | `/` | Sent to all API paths |
| `Max-Age` | `ACCESS_TOKEN_EXPIRE_MINUTES * 60` | Session lifetime |

Logout uses `delete_cookie` with the **same** Path / Secure / SameSite so browsers clear it.

### What must differ from local Docker

| Concern | Local | Production split host |
|---------|-------|------------------------|
| `APP_ENV` | `development` | `production` |
| HTTPS | no | yes (both FE and API) |
| `AUTH_COOKIE_SECURE` | false | true |
| `AUTH_COOKIE_SAMESITE` | lax | none |
| `CORS_ORIGINS` | `http://localhost:3000` | `https://your-frontend` only |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | `https://your-api` |

### Smoke path (login → authenticated call)

**A. Automated (local, already in CI-style pytest):**

```powershell
cd backend
pytest tests/test_api_smoke.py::test_signup_login_cookie_and_me -q
```

This proves: signup sets cookie → `GET /auth/me` with cookie → logout clears → login restores.

**B. Manual browser (local):**

1. Start API + frontend (`docker compose up` + `npm run dev`).
2. Open `http://localhost:3000/signup`, create an account.
3. DevTools → Application → Cookies for `localhost:8000`: `trekpal_access` present, **HttpOnly**.
4. Confirm Application → Local Storage has **no** JWT / `access_token` (only `trek_pal_user` profile if cached).
5. Open `/dashboard` or Network → `GET …/auth/me` → 200 with cookie sent.
6. Refresh the page — still signed in.

**C. After S3 deploy (staging pair that mirrors production):**

1. Set API: `APP_ENV=production`, strong JWT, hosted DB, `CORS_ORIGINS=https://<frontend>`, Secure + SameSite defaults (or explicit `none`).
2. Set frontend: `NEXT_PUBLIC_API_URL=https://<api>`.
3. From the **frontend origin**, sign up / log in, then confirm `GET /auth/me` (or `/trek/history`) returns 200 with credentials.
4. If the cookie is missing on API requests, check: HTTPS on both, `SameSite=None`, `Secure`, CORS origin exact match (no trailing slash mismatch), and `credentials: 'include'`.

Full public proof of the split-host path is completed in **S3** (real URLs). S2 ships the flags, docs, and local smoke.

---

## 7. Checklist before first public deploy

- [ ] `APP_ENV=production`
- [ ] Strong `JWT_SECRET` in host secret store
- [ ] `DATABASE_URL` is hosted Postgres
- [ ] `CORS_ORIGINS` is exact frontend HTTPS origin
- [ ] `AUTH_COOKIE_SECURE` not forced false
- [ ] `AUTH_COOKIE_SAMESITE` is `none` for split host (or `lax` only if same-site)
- [ ] Internal ML left off
- [ ] `GROQ_API_KEY` set if chat/AI itinerary required
- [ ] `NEXT_PUBLIC_API_URL` matches public API
- [ ] `.env` / `.env.local` not committed (`git status` clean of secrets)
- [ ] Browser smoke: login → `/auth/me` with cookie; no JWT in `localStorage`
