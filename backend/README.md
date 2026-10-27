# TrustETL backend (registration only)

FastAPI + SQLAlchemy 2 + PostgreSQL. One endpoint: `POST /api/auth/register`.
The same app serves the existing static pages, so open `http://localhost:8000/Register.html`.

## 1. PostgreSQL (one-time)

Check whether the database already exists (nothing is dropped or overwritten):

    psql -U postgres -lqt | cut -d '|' -f1 | grep -w trustetl_database

If it is missing, create it (pick your own password):

    psql -U postgres -c "CREATE USER trustetl_user WITH PASSWORD 'choose-a-strong-password';"
    psql -U postgres -c "CREATE DATABASE trustetl_database OWNER trustetl_user;"

Create the `users` table (safe to re-run; the app also creates it on startup if missing):

    psql -U trustetl_user -d trustetl_database -f backend/sql/001_create_users.sql

## 2. Python environment (run from the project root, next to Register.html)

    python -m venv .venv
    source .venv/bin/activate            # Windows: .venv\Scripts\activate
    pip install -r backend/requirements.txt

## 3. Configuration

    cp backend/.env.example backend/.env    # Windows: copy backend\.env.example backend\.env

Edit `backend/.env` and set `DATABASE_URL` (URL-encode special characters in the password).
`backend/.env` is git-ignored and is never served over HTTP.

## 4. Run

    uvicorn backend.main:app --reload --port 8000

Open http://localhost:8000/Register.html (API docs: http://localhost:8000/docs).

If you serve the HTML from another origin (e.g. VS Code Live Server on :5500), add that origin
to `CORS_ORIGINS` in `.env` and set `<meta name="trustetl-api-base" content="http://localhost:8000">`
in Register.html. Wildcard origins are intentionally ignored.

## 5. Verify

    curl -i -X POST http://localhost:8000/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{"full_name":"Test User","email":"test.user@example.com","password":"CorrectHorse9!"}'

    psql -U trustetl_user -d trustetl_database -c "SELECT id, full_name, email, left(password_hash, 12) AS hash_prefix, created_at FROM users;"

Expect `201` first, `409` if repeated, and a hash starting `$argon2id$` (never the password).

## Tests

    pip install -r backend/requirements-dev.txt
    python -m pytest backend/tests/test_schemas.py            # no database needed

    # API tests need a separate, throw-away PostgreSQL database (never your real one):
    export TEST_DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/trustetl_test
    python -m pytest backend/tests -v

## API

| Status | Meaning |
|---|---|
| 201 | Created. Body: `id`, `full_name`, `email`, `created_at` (never a password or hash) |
| 409 | Email cannot be used for registration (generic message) |
| 422 | Validation failed. Body: `{"detail": ..., "errors": {"field": "message"}}` (input is never echoed) |
| 503 | Database unavailable (no internal details) |

Rules: name 2-100 chars (whitespace trimmed/collapsed); email trimmed + lowercased, max 100;
password 8-64 chars, no whitespace (same limits as the existing login page); hashed with Argon2id.
