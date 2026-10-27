"""Password hashing (Argon2id)."""

from argon2 import PasswordHasher

# argon2-cffi's PasswordHasher uses Argon2id with the RFC 9106 low-memory profile.
_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """Return a salted Argon2id hash (includes parameters and salt)."""
    return _hasher.hash(password)
