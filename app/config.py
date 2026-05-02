from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    database_url: str
    redis_url: str
    upload_dir: str
    embedding_model: str
    embedding_dimension: int
    max_upload_mb: int
    cors_origins: str

    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_api_key: str | None = None
    ollama_chat_model: str = "qwen3.5:397b-cloud"
    ollama_timeout_seconds: float = 180.0

    @field_validator("ollama_api_key", mode="before")
    @classmethod
    def empty_api_key_none(cls, v: object) -> str | None:
        if isinstance(v, str) and (s := v.strip()):
            return s
        return None

    @property
    def async_database_url(self) -> str:
        u = self.database_url
        if u.startswith(("postgresql://", "postgres://")):
            return "postgresql+asyncpg://" + u.split("://", 1)[1]
        return u


@lru_cache
def get_settings() -> Settings:
    return Settings()
