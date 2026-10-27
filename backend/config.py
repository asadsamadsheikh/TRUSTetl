"""Application settings, loaded from environment variables / backend/.env."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Required. No default on purpose: credentials must come from the environment.
    database_url: str

    # Comma-separated browser origins allowed to call the API cross-origin.
    cors_origins: str = "http://localhost:8000,http://127.0.0.1:8000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip() and o.strip() != "*"]


settings = Settings()
