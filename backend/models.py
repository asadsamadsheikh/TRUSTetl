"""SQLAlchemy models. Keep in sync with sql/001_create_users.sql."""

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("email", name="uq_users_email"),
        CheckConstraint("char_length(btrim(full_name)) >= 2", name="ck_users_full_name_min_length"),
        CheckConstraint("email = lower(email)", name="ck_users_email_lowercase"),
        CheckConstraint("position('@' in email) > 1", name="ck_users_email_has_at"),
        CheckConstraint("char_length(password_hash) > 0", name="ck_users_password_hash_not_empty"),
    )
