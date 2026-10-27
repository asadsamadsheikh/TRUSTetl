"""Unit tests for request validation. No database or web server needed."""

import pytest
from pydantic import ValidationError

from backend.schemas import RegisterRequest, RegisterResponse

VALID = {"full_name": "Vedant Meshram", "email": "vedant@example.com", "password": "ExamplePassword123!"}


def make(**overrides):
    return RegisterRequest(**{**VALID, **overrides})


def error_fields(**overrides):
    with pytest.raises(ValidationError) as info:
        make(**overrides)
    return {e["loc"][0] for e in info.value.errors()}


def test_valid_payload():
    req = make()
    assert req.full_name == "Vedant Meshram"
    assert req.email == "vedant@example.com"


def test_name_is_trimmed_and_collapsed():
    assert make(full_name="   Vedant    Meshram \n").full_name == "Vedant Meshram"


def test_email_is_normalised():
    assert make(email="  Vedant@Example.COM ").email == "vedant@example.com"


@pytest.mark.parametrize("name", ["", "   ", "A", "x" * 101, "Bad\x00Name"])
def test_bad_names(name):
    assert error_fields(full_name=name) == {"full_name"}


@pytest.mark.parametrize(
    "email",
    ["", "plain", "a@b", "a@b.c", "@example.com", "a b@example.com", "a@@example.com",
     "a..b@example.com", ".a@example.com", "a.@example.com", "a@-example.com",
     "a@example..com", "a" * 90 + "@example.com"],
)
def test_bad_emails(email):
    assert error_fields(email=email) == {"email"}


@pytest.mark.parametrize("password", ["", "short7!", "has space inside1", "x" * 65, " leading1234"])
def test_bad_passwords(password):
    assert error_fields(password=password) == {"password"}


def test_password_boundaries_and_not_modified():
    assert make(password="12345678").password == "12345678"
    assert make(password="x" * 64).password == "x" * 64


def test_non_string_values_rejected():
    assert error_fields(full_name=123) == {"full_name"}
    assert error_fields(email=None) == {"email"}


def test_missing_and_extra_fields_rejected():
    with pytest.raises(ValidationError):
        RegisterRequest(full_name="A B", email="a@b.co")
    with pytest.raises(ValidationError):
        RegisterRequest(**VALID, is_admin=True)


def test_response_schema_has_no_secret_fields():
    assert set(RegisterResponse.model_fields) == {"id", "full_name", "email", "created_at"}
