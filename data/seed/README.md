# Seed data — point-in-time snapshot (NOT live data)

These JSON files are a **one-time export** of the legacy Firestore database
(`migration-scripts/export-firestore.ts`, exported 2026-09-21). They are the
data source for Phase 1 (and Phase 2 in the admin repo) until the real
MongoDB backend exists.

**Read this before using or deploying the app:**

- This is a **snapshot, not production-connected data.** Orders, reviews,
  stock, prices and settings changed on the legacy site after the export are
  **not** reflected here, and anything written through this app is **not**
  saved to the live store.
- **The app must not be treated as production-connected until Phase 3**
  replaces `lib/api/*` with the real backend API.
- **Contains real customer PII and live third-party credentials**
  (`orders.json`: names, phones, addresses, bKash numbers/TrxIDs;
  `settings.json`: Telegram bot token, Facebook CAPI token, courier API
  secrets; `admin_audit_logs.json`: admin emails/devices). Do **not** commit
  `*.json` here to a public repo — they are git-ignored. See
  `SECURITY_RISKS.md` #16.
- Read only from server-side code in `lib/api/*`. Never import these files
  from a client component or expose `settings.json` unfiltered.

| File | Documents | Notes |
|---|---|---|
| products.json | 94 | Every product has a base64 `image` (use `unoptimized`) |
| categories.json | 9 | |
| orders.json | 7 | Real customer orders |
| reviews.json | 2 | |
| settings.json | 1 | Single doc, id `general`; contains secrets |
| admin_audit_logs.json | 8 | Admin-only (Phase 2) |

Not exported (by design): `customer_accounts` (plaintext PINs), `user_sessions`.
