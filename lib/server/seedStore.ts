// NOTE: no `server-only` import on purpose - client components are SSR-compiled too and legitimately run this code on
// the server. The browser bundle never contains it: `typeof window === 'undefined'` branches in lib/api/* are dead-code-eliminated.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { CategoryItem, Order, Product, ProductReview } from '@/types';

/**
 * TEMP: Phase 1 only, replaced by real API in Phase 3.
 *
 * Local "database" for the storefront:
 *  - READS come from the one-time Firestore export in `data/seed/*.json` (point-in-time snapshot,
 *    NOT live data — see data/seed/README.md).
 *  - WRITES (orders, reviews, review-driven product rating changes) cannot reach a real backend yet, so they
 *    are appended to small JSON files in `data/runtime/` (git-ignored) and merged over the seed on read.
 *    Delete `data/runtime/` to reset to the pristine snapshot.
 *
 * Only `lib/api/*.ts` (and the /api route handlers that back them) may import this module.
 */

const SEED_DIR = path.join(process.cwd(), 'data', 'seed');
const RUNTIME_DIR = path.join(process.cwd(), 'data', 'runtime');

type Doc = Record<string, any>;

interface MediaEntry {
  mime: string;
  buffer: Buffer;
}

interface StoreState {
  products: Product[];
  categories: CategoryItem[];
  orders: Order[];
  reviews: ProductReview[];
  settings: Doc;
  media: Map<string, MediaEntry>;
  runtimeOrders: Order[];
  runtimeReviews: ProductReview[];
  ratingOverrides: Record<string, { rating: number; reviewCount: number }>;
}

const g = globalThis as unknown as { __abpSeedStore?: StoreState };

function readJson<T>(dir: string, file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function writeRuntime(file: string, data: unknown) {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.writeFileSync(path.join(RUNTIME_DIR, file), JSON.stringify(data, null, 2));
}

/**
 * Seed products/categories/settings store images as base64 data URLs (multi-MB). Shipping those through JSON
 * responses / RSC payloads would be unusable, so every data URL is lifted out into an in-memory media table and
 * replaced by a stable `/api/media/<hash>` URL (served by app/api/media/[hash]/route.ts).
 * TEMP: Phase 1 only — Phase 3 serves real image URLs from the backend / object storage.
 */
function externalizeMedia<T>(value: T, media: Map<string, MediaEntry>): T {
  if (typeof value === 'string') {
    if (!value.startsWith('data:image/')) return value;
    const comma = value.indexOf(',');
    if (comma < 0) return value;
    const meta = value.slice(5, comma); // e.g. image/jpeg;base64
    const mime = meta.split(';')[0] || 'image/jpeg';
    const isB64 = meta.includes(';base64');
    const payload = value.slice(comma + 1);
    const buffer = isB64 ? Buffer.from(payload, 'base64') : Buffer.from(decodeURIComponent(payload));
    const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 24);
    media.set(hash, { mime, buffer });
    return `/api/media/${hash}` as unknown as T;
  }
  if (Array.isArray(value)) return value.map((v) => externalizeMedia(v, media)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Doc = {};
    for (const [k, v] of Object.entries(value as Doc)) out[k] = externalizeMedia(v, media);
    return out as T;
  }
  return value;
}

function load(): StoreState {
  const media = new Map<string, MediaEntry>();
  const products = externalizeMedia(readJson<Product[]>(SEED_DIR, 'products.json', []), media);
  const categories = externalizeMedia(readJson<CategoryItem[]>(SEED_DIR, 'categories.json', []), media);
  const orders = externalizeMedia(readJson<Order[]>(SEED_DIR, 'orders.json', []), media);
  const reviews = readJson<ProductReview[]>(SEED_DIR, 'reviews.json', []);
  const settingsDocs = externalizeMedia(readJson<Doc[]>(SEED_DIR, 'settings.json', []), media);
  const settings = settingsDocs.find((d) => d.id === 'general') ?? settingsDocs[0] ?? {};

  if (products.length === 0) {
    console.warn('[seedStore] data/seed/products.json is missing or empty — see data/seed/README.md');
  }

  return {
    products,
    categories,
    orders,
    reviews,
    settings,
    media,
    runtimeOrders: readJson<Order[]>(RUNTIME_DIR, 'orders.json', []),
    runtimeReviews: readJson<ProductReview[]>(RUNTIME_DIR, 'reviews.json', []),
    ratingOverrides: readJson(RUNTIME_DIR, 'product-ratings.json', {}),
  };
}

function state(): StoreState {
  if (!g.__abpSeedStore) g.__abpSeedStore = load();
  return g.__abpSeedStore;
}

/* ------------------------------------------------------------------ products */

// `costPrice` is an admin-only field (purchase price) that must never reach a customer.
function toPublicProduct(p: Product): Product {
  const { costPrice: _cost, ...rest } = p as Product & { costPrice?: number };
  const o = state().ratingOverrides[p.id];
  return o ? { ...rest, rating: o.rating, reviewCount: o.reviewCount } : rest;
}

export function listProducts(): Product[] {
  return state().products.map(toPublicProduct);
}

export function findProductByKey(key: string): Product | undefined {
  const k = decodeURIComponent(key).trim();
  const lower = k.toLowerCase();
  const all = state().products;
  // Same precedence as legacy: id, then slug, then (case-insensitive) name-contains.
  const hit =
    all.find((p) => p.id === k) ??
    all.find((p) => p.slug === k) ??
    all.find((p) => p.id.toLowerCase() === lower || (p.slug ?? '').toLowerCase() === lower) ??
    (lower.length >= 3 ? all.find((p) => p.name.toLowerCase().includes(lower)) : undefined);
  return hit ? toPublicProduct(hit) : undefined;
}

/* ---------------------------------------------------------------- categories */

export function listCategories(): CategoryItem[] {
  // Legacy: sort by `order` (missing → 999) so the admin's manual ordering is kept.
  return [...state().categories].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

/* ------------------------------------------------------------------ settings */

export function getRawSettings(): Doc {
  return state().settings;
}

/* -------------------------------------------------------------------- media */

export function getMedia(hash: string): MediaEntry | undefined {
  return state().media.get(hash);
}

/* ------------------------------------------------------------------- orders */

export function listOrders(): Order[] {
  const s = state();
  return [...s.runtimeOrders, ...s.orders];
}

export function findOrderById(id: string): Order | undefined {
  const needle = id.trim().toUpperCase();
  return listOrders().find((o) => (o.id || '').toUpperCase() === needle || (o.trackingCode || '').toUpperCase() === needle);
}

export function insertOrder(order: Order): Order {
  const s = state();
  // Legacy generated `AB-<6 digits>` in the browser with no uniqueness check (BUG_FIXES.md #7). Ensure uniqueness here.
  let id = order.id;
  while (!id || findOrderById(id)) id = `AB-${Math.floor(100000 + Math.random() * 900000)}`;
  const saved: Order = { ...order, id };
  s.runtimeOrders.unshift(saved);
  writeRuntime('orders.json', s.runtimeOrders); // TEMP: Phase 1 only, replaced by real API in Phase 3
  return saved;
}

/* ------------------------------------------------------------------ reviews */

export function listReviews(productId?: string): ProductReview[] {
  const s = state();
  const all = [...s.runtimeReviews, ...s.reviews];
  return productId ? all.filter((r) => r.productId === productId) : all;
}

export function insertReview(review: ProductReview): ProductReview {
  const s = state();
  s.runtimeReviews.unshift(review);
  writeRuntime('reviews.json', s.runtimeReviews); // TEMP: Phase 1 only, replaced by real API in Phase 3

  // Keep the product's aggregate in sync (legacy did this in the browser — see BUG_FIXES.md #3 for the fix).
  const base = s.products.find((p) => p.id === review.productId);
  if (base) {
    const cur = s.ratingOverrides[base.id] ?? { rating: base.rating ?? 0, reviewCount: base.reviewCount ?? 0 };
    const count = cur.reviewCount + 1;
    const rating = Number(((cur.rating * cur.reviewCount + review.rating) / count).toFixed(1));
    s.ratingOverrides[base.id] = { rating, reviewCount: count };
    writeRuntime('product-ratings.json', s.ratingOverrides); // TEMP: Phase 1 only
  }
  return review;
}
