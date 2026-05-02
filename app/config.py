from functools import lru_cache

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

    @property
    def async_database_url(self) -> str:
        u = self.database_url
        if u.startswith(("postgresql://", "postgres://")):
            return "postgresql+asyncpg://" + u.split("://", 1)[1]
        return u


@lru_cache
def get_settings() -> Settings:
    return Settings()
