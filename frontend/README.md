# VectorDock frontend

Next.js 15 App Router · shadcn/ui · TanStack Query · Zustand · FastAPI backend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # API adresini ayarlayın
npm run dev
```

`NEXT_PUBLIC_API_URL` varsayılanı `http://localhost:8000`. Backend’i Docker veya venv ile aynı adreste çalıştırın.

### Tüm stack (Docker Compose, kök dizin)

```bash
docker compose up -d --build
```

Arayüz: **http://localhost:3000** — API portu 8000 olduğu sürece tarayıcıdan `NEXT_PUBLIC_API_URL=http://localhost:8000` ile çalışır (compose varsayılanı).

Sunucuya deploy ederken imajı şu argümanla yeniden derleyin:  
`NEXT_PUBLIC_API_URL=http://SUNUCU_IP:8000`
