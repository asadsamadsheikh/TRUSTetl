-- TrustETL: users table for registration.
-- Safe to re-run: it never drops or alters existing objects.
-- Run inside the trustetl_database database:
--   psql -d trustetl_database -f backend/sql/001_create_users.sql

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL        PRIMARY KEY,
    full_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(100)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT uq_users_email                   UNIQUE (email),
    CONSTRAINT ck_users_full_name_min_length    CHECK (char_length(btrim(full_name)) >= 2),
    CONSTRAINT ck_users_email_lowercase         CHECK (email = lower(email)),
    CONSTRAINT ck_users_email_has_at            CHECK (position('@' in email) > 1),
    CONSTRAINT ck_users_password_hash_not_empty CHECK (char_length(password_hash) > 0)
);
