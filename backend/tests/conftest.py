"""API tests need a REAL PostgreSQL database (never SQLite).

    export TEST_DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/trustetl_test
    python -m pytest backend/tests -v

Use a separate throw-away database for tests, not your real one. API tests are skipped if
TEST_DATABASE_URL is not set.
"""

import os

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")

# Must be set before backend.config is imported anywhere.
if TEST_DATABASE_URL:
    os.environ["DATABASE_URL"] = TEST_DATABASE_URL
