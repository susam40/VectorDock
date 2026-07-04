# VectorDock

Enterprise-grade **RAG** (Retrieval-Augmented Generation) platform for document ingestion, vector retrieval, query playground, and administration console.

[Overview](#-overview) · [Key Features](#-key-features) · [Architecture](#-architecture) · [Quick Start (Docker)](#-quick-start-docker) · [Local Installation](#-local-installation) · [Environment Variables](#-environment-variables) · [Project Structure](#-project-structure)

---

## 📖 Overview
VectorDock is an enterprise-grade RAG (Retrieval-Augmented Generation) platform built to manage document collections, ingest various formats (PDF, DOCX, TXT, MD, and URLs), and perform high-performance semantic search.

It leverages an asynchronous processing pipeline powered by `arq` and Redis to handle document chunking and embedding generation under the hood. All vectors are stored and indexed in PostgreSQL using the `pgvector` extension. An interactive Next.js administration console provides a central interface featuring a comprehensive metrics dashboard, a query playground with latency breakdown, and an OpenAI-compatible assistant chat with custom prompt template editing.

---

## ✨ Key Features
- 📊 **Monitoring Dashboard (`/dashboard`)**: Instant statistics on document count, total chunks, collections count, and real-time activity logs.
- 📁 **Collections Manager (`/collections`)**: Create and configure independent vector index collections with customized chunk sizes, overlap margins, distance thresholds, top-k configurations, and embedding model paths.
- 📥 **Document Ingestion (`/documents`)**: Upload local files (PDF, DOCX, TXT, Markdown) or ingest content directly from external URLs.
- ⚡ **Asynchronous Background Processing**: High-throughput processing pipeline utilizing `arq` queue workers and Redis to ensure non-blocking file uploads.
- 🔍 **Vector Search**: PostgreSQL 16 backed by `pgvector` index extensions for robust and high-speed semantic retrieval.
- 🧪 **Query Playground (`/playground`)**: Interactive workspace to test search queries, adjust similarity parameters, view real-time latency breakdowns, and inspect retrieved document chunks.
- 🤖 **Assistant Chat (`/assistant` and `/prompts`)**: Integrated OpenAI-compatible assistant client supporting Ollama and other API providers with live system prompt tuning.

---

## 🏗️ Architecture
```mermaid
graph TD
    subgraph Client [Client Tier - Next.js]
        FE[Frontend SPA Console] --> |RAG & Assistant Chat| PL[Playground & Assistant]
        FE --> |Upload Files / Import URLs| DI[Document Management]
    end

    subgraph Server [Backend Tier - FastAPI]
        API[FastAPI Gateway]
        DB[(PostgreSQL + pgvector)]
        REDIS[(Redis Queue)]
        WRK[arq Ingestion Worker]
        EMB[Sentence Transformers / BAAI-bge-m3]
        LLM[OpenAI-compatible LLM / Ollama]
    end

    FE -->|REST API Requests| API
    API -->|Read/Write Metadata| DB
    API -->|Enqueue Ingest Job| REDIS
    REDIS -->|Dequeue Job| WRK
    WRK -->|Extract Text| WRK
    WRK -->|Generate Embeddings| EMB
    WRK -->|Save Chunks & Vectors| DB
    API -->|Semantic Search Query| DB
    API -->|Chat Completion| LLM
    
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef highlight fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    class FE,API,WRK highlight;
```

---

## 🚀 Quick Start (Docker)
> [!NOTE]
> Docker and Docker Compose are required to spin up the containerized stack.

```bash
# 1. Copy the environment template
cp .env.template .env

# 2. Run the environment
make up
# or: docker compose up --build
```

Once the stack is running, the following services will be available:

| Service | Address |
|---------|---------|
| **Web Console** | [http://localhost:3000](http://localhost:3000) |
| **API Gateway** | [http://localhost:8000](http://localhost:8000) |
| **Interactive API Docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **PostgreSQL Database** | `localhost:5432` |
| **Redis Queue** | `localhost:6379` |

To stop the containers:
```bash
make down
```

To monitor real-time logs:
```bash
make compose-logs
```

---

## 💻 Local Installation
If you prefer running the infrastructure (database and queue) via Docker, but running the API gateway, background worker, and React frontend locally:

### 1. Configure Local Environment
Copy the configuration template:
```bash
cp .env.template .env
```
Uncomment and adjust connection parameters in your `.env` for local mode:
```env
DATABASE_URL=postgresql://vectordock:vectordock@localhost:5432/vectordock
REDIS_URL=redis://localhost:6379/0
UPLOAD_DIR=./data/uploads
```

### 2. Set Up Infrastructure
Start only PostgreSQL and Redis containers, initialize your python virtual environment, install dependencies, and run database migrations:
```bash
# Install virtual environment, backend pip requirements, and frontend npm packages
make install

# Spin up PostgreSQL + Redis containers
make infra-up

# Run Alembic migrations to set up the database schema
make migrate
```

### 3. Start Development Services
Run the following three commands in separate terminal sessions:
```bash
# Start FastAPI backend (runs on http://localhost:8000)
make dev-api

# Start arq ingestion worker (handles document chunking & embeddings)
make dev-worker

# Start Next.js frontend (runs on http://localhost:3000)
make dev-web
```
*(To list all available Makefile targets, run `make help`)*

---

## ⚙️ Environment Variables
The application can be configured using a `.env` file at the root directory:

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `DATABASE_URL` | PostgreSQL connection string (auto-generated in Docker Compose) | `postgresql://vectordock:vectordock@localhost:5432/vectordock` |
| `REDIS_URL` | Redis server connection URI | `redis://localhost:6379/0` |
| `UPLOAD_DIR` | Directory to temporarily store uploaded files | `./data/uploads` |
| `EMBEDDING_MODEL` | Hugging Face model identifier for generating vectors | `sentence-transformers` (e.g. `BAAI/bge-m3`) |
| `EMBEDDING_DIMENSION` | Dimension size of the embedding model | `1024` |
| `MAX_UPLOAD_MB` | Maximum allowed size (in MB) for uploaded files | `10` |
| `CORS_ORIGINS` | Permitted origins allowed to access the API Gateway | `http://localhost:3000` |
| `OLLAMA_BASE_URL` | Base URL endpoint for Ollama or OpenAI-compatible model API | `http://127.0.0.1:11434` |
| `OLLAMA_API_KEY` | Optional API Key for LLM services (e.g., NVIDIA NIM) | `None` |
| `OLLAMA_CHAT_MODEL` | Text model name to be used for LLM assistant chat | `qwen3.5:397b-cloud` |
| `OLLAMA_TIMEOUT_SECONDS` | Maximum connection timeout for assistant requests | `180.0` |

---

## 📂 Project Structure
```
VectorDock/
├── app/                        # Python Application Package
│   ├── main.py                 # FastAPI Application & Router configuration
│   ├── config.py               # Application Settings (Pydantic-Settings)
│   ├── api/                    # REST API Endpoints
│   │   ├── collections.py      # Collections CRUD
│   │   ├── documents.py        # Ingestion, status, chunks management
│   │   ├── stats.py            # Dashboard metrics & active logs
│   │   ├── playground.py       # RAG queries & retrieval evaluation
│   │   └── assistant.py        # Chat assistant interfaces
│   ├── db/                     # Database schemas and sessions
│   │   ├── models.py           # SQLAlchemy tables (Collections, Chunks, etc.)
│   │   ├── session.py          # Async Database Session setup
│   │   └── base.py             # Declarative Base
│   ├── schemas/                # Pydantic Request & Response validation models
│   ├── services/               # Core Business Logic
│   │   ├── ingestion.py        # Master Ingestion pipeline
│   │   ├── extraction.py       # Text parsing from PDF/DOCX/TXT/Markdown
│   │   ├── chunking.py         # Advanced text chunking & splitter strategies
│   │   ├── embedding.py        # Sentence-Transformers vector generation
│   │   ├── playground_rag.py   # RAG pipeline implementation
│   │   ├── ollama_client.py    # OpenAI-compatible API connector
│   │   └── assistant_prompt.py # Assistant prompts engine
│   └── workers/                # arq queue configuration and tasks
│       ├── settings.py
│       └── tasks.py            # Async tasks (e.g. ingest_document)
├── alembic/                    # Alembic Database Migrations folder
├── frontend/                   # Next.js Management Web Console
│   ├── app/                    # App Router Pages
│   ├── components/             # Reusable shadcn/ui React components
│   └── lib/                    # API clients, state store, React Hooks
├── main.py                     # Local startup script
├── requirements.txt            # Python Backend dependencies
├── Dockerfile                  # API & Worker Docker build setup
├── docker-compose.yml          # Container configuration for all services
├── Makefile                    # Target shortcuts for dev scripts
└── .env.template               # Standard configuration template
```

---

## 📡 API Reference
| Endpoint Prefix | Description | Features |
|-----------------|-------------|----------|
| `/api/collections` | Collections CRUD | Create, Read, Update, Delete vector index profiles |
| `/api/documents` | Documents Ingestion | Upload, Fetch from URL, Retrieve Status, Reprocess, Delete |
| `/api/stats` | Analytics Metrics | Ingestion metrics, activity counts, document listings |
| `/api/playground` | Playground RAG | Direct vector querying, document comparison, models list |
| `/api/assistant` | Chat Assistant | Dialogue generation, custom prompt template configuration |

> [!TIP]
> Interactive API Docs (Swagger format) can be viewed at: `http://localhost:8000/docs`
