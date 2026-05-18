# VectorDock

Kurumsal düzey **RAG** (Retrieval-Augmented Generation) platformu: belge alımı, vektör geri getirme, sorgu laboratuvarı ve yönetim arayüzü.

## Özellikler

- **Koleksiyonlar** — parçalama, eşik, top-k ve gömme modeli ayarları
- **Belge alımı** — dosya yükleme, URL’den içe aktarma, PDF/DOCX/TXT/Markdown desteği
- **Arka plan işleme** — arq + Redis ile asenkron parçalama ve gömme
- **Vektör arama** — PostgreSQL + pgvector ile anlamsal geri getirme
- **Playground** — RAG sorguları, gecikme dökümü ve geri getirilen parçalar
- **Asistan** — OpenAI uyumlu LLM sağlayıcısı (NVIDIA Integrate / Ollama)
- **Dashboard** — belge, parça ve koleksiyon istatistikleri

## Mimari

```
┌─────────────┐     REST      ┌──────────────┐     arq      ┌─────────────┐
│  Next.js    │ ────────────► │   FastAPI    │ ───────────► │   Worker    │
│  frontend   │               │   (app/)     │              │  (ingestion)│
└─────────────┘               └──────┬───────┘              └──────┬──────┘
                                     │                             │
                              ┌──────┴───────┐              ┌──────┴──────┐
                              │  PostgreSQL  │              │    Redis    │
                              │  + pgvector  │              │             │
                              └──────────────┘              └─────────────┘
```

| Katman | Teknoloji |
|--------|-----------|
| API | FastAPI, SQLAlchemy 2 (async), Pydantic Settings |
| Kuyruk | arq, Redis |
| Veritabanı | PostgreSQL 16, pgvector |
| Gömme | sentence-transformers (varsayılan: `BAAI/bge-m3`, 1024 boyut) |
| LLM | OpenAI uyumlu HTTP API (`OLLAMA_BASE_URL`) |
| Frontend | Next.js 15, React 19, TanStack Query, shadcn/ui |

## Proje yapısı

```
VectorDock/
├── app/                        # Python uygulama paketi
│   ├── main.py                 # FastAPI uygulaması ve router kayıtları
│   ├── config.py               # Ortam değişkenleri (Settings)
│   ├── api/                    # REST uçları
│   │   ├── collections.py
│   │   ├── documents.py
│   │   ├── stats.py
│   │   ├── logs.py
│   │   ├── playground.py
│   │   └── assistant.py
│   ├── db/                     # SQLAlchemy modelleri ve oturum
│   │   ├── models.py
│   │   ├── session.py
│   │   └── base.py
│   ├── schemas/                # Pydantic istek/yanıt modelleri
│   ├── services/               # İş mantığı
│   │   ├── ingestion.py        # Belge işleme hattı
│   │   ├── extraction.py       # PDF, DOCX, metin çıkarma
│   │   ├── chunking.py         # Metin parçalama
│   │   ├── embedding.py        # Vektör gömme
│   │   ├── playground_rag.py   # RAG sorgu hattı
│   │   ├── ollama_client.py    # LLM istemcisi
│   │   └── assistant_prompt.py
│   └── workers/                # arq işçisi
│       ├── settings.py
│       └── tasks.py
├── alembic/                    # Veritabanı migrasyonları
├── frontend/                   # Next.js yönetim konsolu
│   ├── app/                    # App Router sayfaları
│   ├── components/             # UI bileşenleri
│   └── lib/                    # API istemcileri, hook’lar, store
├── main.py                     # Yerel geliştirme giriş noktası
├── requirements.txt            # Python bağımlılıkları
├── Dockerfile
├── docker-compose.yml
├── Makefile                    # Geliştirme kısayolları
└── .env.template               # Ortam değişkeni şablonu
```

### Frontend sayfaları

| Yol | Açıklama |
|-----|----------|
| `/dashboard` | Genel istatistikler ve aktivite |
| `/collections` | Koleksiyon listesi ve oluşturma |
| `/collections/[id]` | Koleksiyon detayı ve ayarları |
| `/documents` | Belge listesi ve yükleme |
| `/documents/[id]` | Belge detayı ve parçalar |
| `/playground` | RAG sorgu laboratuvarı |
| `/prompts` | Asistan sistem prompt düzenleyici |
| `/logs` | İşlem izleri (API iskeleti) |

## Gereksinimler

- **Docker Compose** (önerilen): Docker 24+, Docker Compose v2
- **Yerel geliştirme**: Python 3.11+, Node.js 20+, Make

## Hızlı başlangıç (Docker Compose)

```bash
cp .env.template .env
make up
```

Servisler:

| Servis | Adres |
|--------|-------|
| Web arayüzü | http://localhost:3000 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

Durdurmak:

```bash
make down
```

Logları izlemek:

```bash
make compose-logs
```

## Yerel geliştirme

Altyapıyı Docker’da, uygulamayı sanal ortamda çalıştırma:

```bash
cp .env.template .env
```

`.env` içinde yerel mod için şu satırların yorumunu kaldırın:

```env
DATABASE_URL=postgresql://vectordock:vectordock@localhost:5432/vectordock
REDIS_URL=redis://localhost:6379/0
UPLOAD_DIR=./data/uploads
```

Kurulum ve çalıştırma:

```bash
make install          # venv + pip + npm ci
make infra-up         # postgres + redis
make migrate          # alembic upgrade head
```

Üç ayrı terminalde:

```bash
make dev-api          # http://localhost:8000
make dev-worker       # arq ingestion worker
make dev-web          # http://localhost:3000
```

Tüm make hedefleri için:

```bash
make help
```

## Ortam değişkenleri

`.env.template` dosyasından kopyalayın. Önemli alanlar:

| Değişken | Açıklama |
|----------|----------|
| `POSTGRES_*` | Docker Compose Postgres ayarları |
| `REDIS_URL` | Redis bağlantı dizesi |
| `UPLOAD_DIR` | Yüklenen dosyaların dizini |
| `EMBEDDING_MODEL` | sentence-transformers model adı |
| `EMBEDDING_DIMENSION` | Vektör boyutu (varsayılan: 1024) |
| `MAX_UPLOAD_MB` | Maksimum yükleme boyutu |
| `CORS_ORIGINS` | API’ye izin verilen origin’ler |
| `NEXT_PUBLIC_API_URL` | Frontend → API adresi |
| `OLLAMA_BASE_URL` | OpenAI uyumlu LLM uç noktası |
| `OLLAMA_API_KEY` | Sağlayıcı API anahtarı (opsiyonel) |
| `OLLAMA_CHAT_MODEL` | Sohbet modeli adı |

> Docker Compose modunda `DATABASE_URL` yazmayın; `POSTGRES_*` değişkenlerinden otomatik üretilir.

## API uçları

| Prefix | Uçlar |
|--------|-------|
| `/api/collections` | CRUD |
| `/api/documents` | listele, yükle, URL’den al, parçalar, yeniden indeksle, sil |
| `/api/stats` | genel bakış, aktivite |
| `/api/playground` | RAG sorgusu, Ollama model listesi |
| `/api/assistant` | sohbet, varsayılan prompt |
| `/api/logs` | işlem günlükleri (henüz boş dönüş) |

İnteraktif dokümantasyon: http://localhost:8000/docs

## Belge işleme hattı

1. Dosya veya URL ile belge oluşturulur (`status: pending`)
2. arq kuyruğuna `ingest_document` görevi eklenir
3. Worker metni çıkarır (PDF/DOCX/TXT/MD)
4. Koleksiyon ayarlarına göre parçalanır
5. Gömme modeli ile vektörleştirilir
6. `document_chunks` tablosuna yazılır (`status: ready`)

## Veritabanı migrasyonları

```bash
make migrate          # upgrade head
make downgrade        # bir revizyon geri
make db-current       # mevcut revizyon
make db-history       # geçmiş
```

Migrasyon dosyaları: `alembic/versions/`

## Frontend

Ayrıntılı frontend notları: [frontend/README.md](frontend/README.md)

```bash
cd frontend
npm ci
npm run dev
```

Production build:

```bash
make build-web-prod
```

## Geliştirme notları

- API katmanı yalnızca istek/yanıt orkestrasyonu yapar; iş mantığı `app/services/` altındadır.
- Worker, gömme modelini başlangıçta belleğe yükler; ilk ingestion biraz daha uzun sürebilir.
- LLM sağlayıcısı OpenAI uyumlu API bekler (NVIDIA Integrate veya yerel Ollama).
- Frontend, `NEXT_PUBLIC_API_URL` üzerinden FastAPI ile konuşur.
