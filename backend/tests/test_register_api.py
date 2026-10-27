"""End-to-end API tests against a real PostgreSQL database (see conftest.py)."""

import os

import pytest

if not os.environ.get("TEST_DATABASE_URL"):
    pytest.skip("TEST_DATABASE_URL not set (PostgreSQL required)", allow_module_level=True)

from fastapi.testclient import TestClient
from sqlalchemy import text

from backend.database import engine
from backend.main import app

URL = "/api/auth/register"
VALID = {"full_name": "Test User", "email": "test.user@example.com", "password": "CorrectHorse9!"}


@pytest.fixture()
def client():
    with TestClient(app) as c:  # runs lifespan -> creates users table if missing
        with engine.begin() as conn:
            conn.execute(text("DELETE FROM users WHERE email LIKE '%@example.com'"))
        yield c
        with engine.begin() as conn:
            conn.execute(text("DELETE FROM users WHERE email LIKE '%@example.com'"))


def row_for(email):
    with engine.connect() as conn:
        return conn.execute(
            text("SELECT id, full_name, email, password_hash, created_at FROM users WHERE email = :e"),
            {"e": email},
        ).first()


def test_register_success_persists_hash_only(client):
    r = client.post(URL, json=VALID)
    assert r.status_code == 201
    body = r.json()
    assert set(body) == {"id", "full_name", "email", "created_at"}
    assert "password" not in r.text.lower().replace("password_hash", "")  # no secrets echoed

    row = row_for("test.user@example.com")
    assert row is not None
    assert row.password_hash != VALID["password"]
    assert row.password_hash.startswith("$argon2id$")
    assert row.created_at is not None


def test_name_and_email_normalised(client):
    r = client.post(URL, json={**VALID, "full_name": "  Test   User ", "email": " Test.User@Example.COM "})
    assert r.status_code == 201
    assert r.json()["full_name"] == "Test User"
    assert r.json()["email"] == "test.user@example.com"


def test_duplicate_email_rejected_case_insensitively(client):
    assert client.post(URL, json=VALID).status_code == 201
    r = client.post(URL, json={**VALID, "email": "TEST.USER@example.com", "full_name": "Someone Else"})
    assert r.status_code == 409
    assert "log in" in r.json()["detail"]
    with engine.connect() as conn:
        assert conn.execute(text("SELECT count(*) FROM users WHERE email='test.user@example.com'")).scalar() == 1


@pytest.mark.parametrize(
    "payload, field",
    [
        ({**VALID, "email": "not-an-email"}, "email"),
        ({**VALID, "password": "short"}, "password"),
        ({**VALID, "full_name": " "}, "full_name"),
    ],
)
def test_validation_errors_are_field_level_and_do_not_echo_input(client, payload, field):
    r = client.post(URL, json=payload)
    assert r.status_code == 422
    assert field in r.json()["errors"]
    assert payload["password"] not in r.text


def test_missing_fields(client):
    r = client.post(URL, json={"email": "a@example.com"})
    assert r.status_code == 422
    assert {"full_name", "password"} <= set(r.json()["errors"])


def test_malformed_json(client):
    r = client.post(URL, content="{not json", headers={"Content-Type": "application/json"})
    assert r.status_code == 422


def test_cors_rejects_unknown_origin(client):
    r = client.options(URL, headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert "access-control-allow-origin" not in r.headers


def test_backend_files_not_served(client):
    for path in ["/backend/.env", "/backend/config.py", "/.env", "/../backend/.env"]:
        assert client.get(path).status_code == 404


def test_register_page_is_served(client):
    r = client.get("/Register.html")
    assert r.status_code == 200 and "Create Account" in r.text
