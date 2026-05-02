FROM python:3.11-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-docker.txt .
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements-docker.txt

COPY alembic.ini .
COPY alembic ./alembic
COPY scripts/docker-migrate.sh /app/scripts/docker-migrate.sh
COPY app ./app
COPY main.py .

RUN chmod +x /app/scripts/docker-migrate.sh \
    && test -f alembic/versions/20260502_0001_initial_pgvector.py \
    && test -f alembic/versions/20260502_0002_collections_fk.py

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
