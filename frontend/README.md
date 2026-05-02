# VectorDock — Frontend

RAG yönetim konsolu: gösterge paneli, belge alımı, sorgu laboratuvarı (hat izi), koleksiyon yapılandırması ve günlükler. **Next.js 15** (App Router), **shadcn/ui**, **Tailwind CSS**, **TanStack Query**, **Zustand**. Arayüz dili Türkçe.

## Gereksinimler

- Node.js 20+ (önerilir)
- npm

## Kurulum ve çalıştırma

```bash
cd frontend
npm install
cp .env.local.example .env.local   # isteğe bağlı
npm run dev
```

Tarayıcı: **http://localhost:3000** (kök `/` → `/dashboard` yönlendirmesi).

| Komut | Açıklama |
|--------|-----------|
| `npm run dev` | Geliştirme sunucusu (Turbopack) |
| `npm run build` | Üretim derlemesi |
| `npm run start` | Üretim sunucusu (`build` sonrası) |
| `npm run lint` | ESLint |

## Ortam değişkenleri

`.env.local` içinde (örnek: `.env.local.example`):

| Değişken | Açıklama |
|-----------|-----------|
| `NEXT_PUBLIC_USE_MOCK` | `true` veya atlanırsa: tüm API katmanı örnek veri kullanır. `false`: gerçek backend’e istek. |
| `NEXT_PUBLIC_API_URL` | Backend kök URL (örn. `http://localhost:8000`). Sondaki `/` olmadan. |

Mock kapalıyken `lib/api/*.ts` içindeki `fetch` çağrıları `{API_BASE}/api/...` yollarına gider; FastAPI tarafında bu yolların uygulanması gerekir.

## Proje yapısı (özet)

```
frontend/
├── app/                 # Rotalar: dashboard, documents, playground, collections, logs
├── components/          # layout, dashboard, documents, playground, collections, logs, ui
├── lib/
│   ├── api/             # İstemci fonksiyonları (mock / gerçek ayrımı)
│   ├── mock/            # Örnek veri ve oturum içi yüklemeler
│   ├── hooks/           # TanStack Query hook’ları
│   ├── store/           # Zustand (kenar çubuğu vb.)
│   ├── types/           # TypeScript tipleri
│   └── tr.ts            # Türkçe arayüz sabitleri (durum eşlemeleri)
└── public/
```

## Özellikler

- **Örnek veri modu**: Backend olmadan tam akış (yükleme, koleksiyon CRUD mock’u, laboratuvar sorgusu, günlükler).
- **Koyu / açık tema**: Başlıktaki tema menüsü (`next-themes`).
- **Duyarlı düzen**: Masaüstünde kenar çubuğu, mobilde sheet menü.

## Backend ile bağlama

1. `.env.local` içinde `NEXT_PUBLIC_USE_MOCK=false` ve `NEXT_PUBLIC_API_URL` ayarlayın.
2. CORS: FastAPI’de frontend kökenine (örn. `http://localhost:3000`) izin verin.
3. Beklenen uç noktalar plana göre `GET/POST/PUT/DELETE` ile `lib/api` altındaki çağrılarla uyumlu olmalıdır (ör. `/api/documents`, `/api/collections`, `/api/playground/query`, `/api/stats`, `/api/logs`).