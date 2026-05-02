# VectorDock frontend

Next.js 15 App Router · shadcn/ui · TanStack Query · Zustand · mock API

```bash
cd frontend
npm install
cp .env.local.example .env.local   # optional
npm run dev
```

- `NEXT_PUBLIC_USE_MOCK=true` (default): in-memory + static mocks.
- `NEXT_PUBLIC_USE_MOCK=false`: calls `NEXT_PUBLIC_API_URL` (FastAPI when you add it).
