# VectorDock

Kurumsal düzey **RAG** (geri artırımlı üretim) platformu için monorepo: belge alımı, vektör geri getirme, gözlemlenebilir hat ve yönetim arayüzü hedeflenir.

## Durum

| Bileşen | Durum |
|---------|--------|
| **Frontend** (`frontend/`) | Next.js 15 yönetim konsolu; örnek veri modu ile çalışır, FastAPI’ye bağlanmaya hazır. |
| **Backend** (kök `main.py`, `api/` vb.) | İskelet / henüz uygulanmadı; FastAPI ve RAG servisleri eklenecek. |

## Hızlı başlangıç (sadece arayüz)

```bash
cd frontend
npm install
npm run dev
```

Ayrıntılar: **[frontend/README.md](frontend/README.md)**

## Depo yapısı (özet)

```
VectorDock/
├── frontend/          # Next.js uygulaması (Türkçe arayüz)
├── api/               # Backend paketi (ileride)
├── core/              # Ortak çekirdek (ileride)
├── services/          # İş mantığı (ileride)
├── main.py            # Geçici giriş noktası — FastAPI ile değiştirilecek
├── requirements.txt   # Python bağımlılıkları (doldurulacak)
├── Dockerfile
└── docker-compose.yml
```

## Sonraki adımlar (backend)

- FastAPI uygulaması ve `frontend` içindeki `lib/api` sözleşmesiyle uyumlu REST uçları
- Belge yükleme, parçalama, gömme, vektör depo ve sorgu laboratuvarı için gerçek RAG hattı
- Ortam: `.env` / `.env.template` ile API anahtarları ve veritabanı

## Katkı / geliştirme

- Frontend: `frontend/` içinde `npm run build` ile derleme doğrulanabilir.
- Python sanal ortamı: proje kökünde `.venv` kullanılabilir (`requirements.txt` güncellendikten sonra `pip install -r requirements.txt`).
