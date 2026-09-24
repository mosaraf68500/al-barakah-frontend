# al-barakah-frontend (Phase 1)

Next.js 15 (App Router) customer storefront for Al Barakah Premium.

> **Not production-connected.** Data is a point-in-time snapshot of the legacy Firestore database in `data/seed/` (git-ignored, contains real customer PII — see `data/seed/README.md`). Orders/reviews placed here are written to `data/runtime/` only. Customer login is a **stub**. Phase 3 replaces `lib/api/*` and `lib/auth/*` with the real backend.

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000
npm run build && npm start
npm run lint                 # tsc --noEmit
```

Structure: `app/` routes · `components/` by feature · `lib/api/` data adapter (the only layer that knows where data comes from) · `lib/server/` seed store (TEMP) · `lib/auth/` auth adapter (stub, TEMP) · `store/` Zustand · `hooks/` · `providers/`.
Reset local writes: delete `data/runtime/`.
