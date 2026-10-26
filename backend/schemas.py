"""Pydantic request/response schemas for registration.

Validation rules intentionally mirror js/register.js (and the existing login page:
passwords are 8-64 characters with no whitespace).
"""

import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

NAME_MIN = 2
NAME_MAX = 100
EMAIL_MAX = 100
EMAIL_LOCAL_MAX = 64
PASSWORD_MIN = 8
PASSWORD_MAX = 64

_CONTROL_CHARS = re.compile(r"[\x00-\x1f\x7f]")
_WHITESPACE_RUN = re.compile(r"\s+")

# Pragmatic ASCII email check (no IDN / quoted local parts). Case is normalised first.
_EMAIL_RE = re.compile(
    r"^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?"
    r"(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*"
    r"\.[a-z]{2,}$"
)


def normalize_email(value: str) -> str:
    """Trim and lowercase: the one canonical form stored and compared."""
    return value.strip().lower()


class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    full_name: str
    email: str
    password: str

    @field_validator("full_name")
    @classmethod
    def _clean_name(cls, value: str) -> str:
        name = _WHITESPACE_RUN.sub(" ", value).strip()
        if not name:
            raise ValueError("Full name is required.")
        if _CONTROL_CHARS.search(name):
            raise ValueError("Full name contains invalid characters.")
        if len(name) < NAME_MIN:
            raise ValueError(f"Full name must be at least {NAME_MIN} characters.")
        if len(name) > NAME_MAX:
            raise ValueError(f"Full name must be {NAME_MAX} characters or fewer.")
        return name

    @field_validator("email")
    @classmethod
    def _clean_email(cls, value: str) -> str:
        email = normalize_email(value)
        if not email:
            raise ValueError("Email is required.")
        if len(email) > EMAIL_MAX:
            raise ValueError(f"Email must be {EMAIL_MAX} characters or fewer.")
        local = email.partition("@")[0]
        if (
            not _EMAIL_RE.match(email)
            or ".." in email
            or local.startswith(".")
            or local.endswith(".")
            or len(local) > EMAIL_LOCAL_MAX
        ):
            raise ValueError("Please enter a valid email address.")
        return email

    @field_validator("password")
    @classmethod
    def _check_password(cls, value: str) -> str:
        # Passwords are never trimmed or altered.
        if not value:
            raise ValueError("Password is required.")
        if len(value) < PASSWORD_MIN:
            raise ValueError(f"Password must contain at least {PASSWORD_MIN} characters.")
        if len(value) > PASSWORD_MAX:
            raise ValueError(f"Password cannot exceed {PASSWORD_MAX} characters.")
        if _WHITESPACE_RUN.search(value):
            raise ValueError("Password cannot contain spaces.")
        return value


class RegisterResponse(BaseModel):
    """Public view of a new user. Deliberately has no password / hash field."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    created_at: datetime
