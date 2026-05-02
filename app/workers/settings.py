"""ARQ worker entry: `arq app.workers.settings.WorkerSettings`."""

from arq.connections import RedisSettings

from app.config import get_settings
from app.workers.tasks import ingest_document, shutdown, startup


class WorkerSettings:
    functions = [ingest_document]
    redis_settings = RedisSettings.from_dsn(get_settings().redis_url)
    on_startup = startup
    on_shutdown = shutdown
