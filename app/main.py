from __future__ import annotations

from contextlib import asynccontextmanager

from arq import create_pool
from arq.connections import RedisSettings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.collections import router as collections_router
from app.api.documents import router as documents_router
from app.api.logs import router as logs_router
from app.api.playground import router as playground_router
from app.api.stats import router as stats_router
from app.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    app.state.arq = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    try:
        yield
    finally:
        await app.state.arq.close()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="VectorDock API", lifespan=lifespan)
    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(documents_router, prefix="/api/documents")
    app.include_router(collections_router, prefix="/api/collections")
    app.include_router(stats_router, prefix="/api/stats")
    app.include_router(logs_router, prefix="/api/logs")
    app.include_router(playground_router, prefix="/api/playground")
    return app


app = create_app()
