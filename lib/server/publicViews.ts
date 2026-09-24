// NOTE: no `server-only` import on purpose - client components are SSR-compiled too and legitimately run this code on
// the server. The browser bundle never contains it: `typeof window === 'undefined'` branches in lib/api/* are dead-code-eliminated.
import type { Order, StoreSettings } from '@/types';
import { DEFAULT_BKASH_CONFIG, DEFAULT_DELIVERY_CONFIG, DEFAULT_FACEBOOK_PIXEL_CONFIG, DEFAULT_SEO_CONFIG } from '@/types';
import { findOrderById, getRawSettings, listOrders } from './seedStore';

/**
 * TEMP: Phase 1 only. Server-side projections that decide what a *customer's browser* may see.
 * (Legacy shipped the whole world-readable `settings/general` doc and the whole `orders` collection to every visitor —
 *  SECURITY_RISKS.md #3 / #8. These views are what the Phase 3 public endpoints must return.)
 */

/* ------------------------------------------------------------------ settings */

export function getPublicSettings(): StoreSettings {
  const raw = getRawSettings();
  const fb = { ...DEFAULT_FACEBOOK_PIXEL_CONFIG, ...(raw.facebookPixelConfig ?? {}) };
  const bkash = { ...DEFAULT_BKASH_CONFIG, ...(raw.bkashConfig ?? {}) };
  return {
    // Keys absent from the snapshot fall back to the same defaults legacy `App.tsx` used
    // (reviews ON, coupons OFF, no coupons).
    enableCustomerReviews: typeof raw.enableCustomerReviews === 'boolean' ? raw.enableCustomerReviews : true,
    enableCoupons: typeof raw.enableCoupons === 'boolean' ? raw.enableCoupons : false,
    coupons: Array.isArray(raw.coupons) ? raw.coupons : [],
    heroBanners: raw.heroBanners ?? null,
    topSelling: raw.topSelling ?? null,
    deliveryConfig: { ...DEFAULT_DELIVERY_CONFIG, ...(raw.deliveryConfig ?? {}) },
    // bKash gateway credentials / Facebook CAPI token are secrets: blanked before leaving the server.
    bkashConfig: { ...bkash, gateway: { ...DEFAULT_BKASH_CONFIG.gateway } },
    seoConfig: { ...DEFAULT_SEO_CONFIG, ...(raw.seoConfig ?? {}) },
    facebookPixelConfig: { ...fb, accessToken: '' },
  };
}

/** Full Facebook config *including* the CAPI token — server-side use only (app/api/analytics). */
export function getFacebookConfigWithSecret() {
  return { ...DEFAULT_FACEBOOK_PIXEL_CONFIG, ...(getRawSettings().facebookPixelConfig ?? {}) };
}

/** Telegram config — server-side use only (app/api/notifications). */
export function getTelegramConfigWithSecret(): { enabled: boolean; botToken: string; chatId: string } | null {
  const t = getRawSettings().notificationConfig?.telegram;
  return t && t.enabled && t.botToken && t.chatId ? t : null;
}

/* ------------------------------------------------------------------ masking */
// Ported from legacy server/routes/api.ts (maskPhoneNumber / maskEmailAddress / maskDeliveryAddress).

function maskPhone(phone?: string | null): string {
  if (!phone) return 'N/A';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 7) return '***';
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
}

function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `*@${domain}`;
  return `${local[0]}***${local.slice(-1)}@${domain}`;
}

function maskAddress(address?: string | null, city?: string | null): string {
  const cityStr = city || 'Dhaka';
  if (!address) return cityStr;
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) return `***, ${parts[parts.length - 1]} (${cityStr})`;
  return `***, ${cityStr}`;
}

/* ---------------------------------------------------------- order tracking */

/** Public "track my order" result: masked PII, no payment references, no admin fields. */
function toTrackedOrder(o: Order): Order {
  return {
    id: o.id,
    trackingCode: o.trackingCode,
    createdAt: o.createdAt,
    status: o.status,
    subtotal: o.subtotal,
    discount: o.discount,
    shipping: o.shipping,
    total: o.total,
    currency: o.currency,
    items: o.items,
    customerEmail: maskEmail(o.customerEmail || o.customer?.email),
    customerPhone: maskPhone(o.customerPhone || o.customer?.phone),
    customer: o.customer
      ? {
          fullName: o.customer.fullName,
          email: maskEmail(o.customer.email),
          phone: maskPhone(o.customer.phone),
          address: maskAddress(o.customer.address, o.customer.city),
          city: o.customer.city,
          paymentMethod: o.customer.paymentMethod,
        }
      : undefined,
  };
}

export function trackOrderByCode(rawCode: string): Order | null {
  const query = rawCode.trim().toUpperCase();
  if (!query) return null;
  const exact = findOrderById(query);
  if (exact) return toTrackedOrder(exact);

  // Legacy fuzzy match (contains / same digits). Requires ≥4 chars so a stray letter can't return somebody's order.
  if (query.length < 4) return null;
  const queryNum = query.replace(/\D/g, '');
  const fuzzy = listOrders().find((o) => {
    const oid = (o.id || '').toUpperCase();
    const numOnly = oid.replace(/\D/g, '');
    return oid.includes(query) || (numOnly && queryNum && numOnly === queryNum);
  });
  return fuzzy ? toTrackedOrder(fuzzy) : null;
}

/* ------------------------------------------------------------- my orders */

/**
 * Customer dashboard "Orders". Legacy downloaded the WHOLE orders collection into every browser and filtered
 * client-side (SECURITY_RISKS.md #8). Filtering now happens here with the same matching rules
 * (userId / email / last-10 phone digits), newest first.
 * TEMP: Phase 1 only — the identity is client-supplied (stub auth); Phase 3 derives it from the JWT.
 */
export function ordersForCustomer(id: { email?: string; phone?: string; userId?: string }): Order[] {
  const targetEmail = (id.email || '').toLowerCase().trim();
  const targetPhone = (id.phone || '').replace(/\D/g, '').slice(-10);
  const targetUserId = id.userId || '';
  if (!targetEmail && !targetPhone && !targetUserId) return [];

  return listOrders()
    .filter((o) => {
      if (targetUserId && o.userId && o.userId === targetUserId) return true;
      const oEmail = (o.customerEmail || o.customer?.email || '').toLowerCase().trim();
      if (targetEmail && oEmail) {
        if (oEmail === targetEmail) return true;
        if (oEmail.replace('user_', '') === targetEmail.replace('user_', '')) return true;
      }
      const oPhone = (o.customerPhone || o.customer?.phone || '').replace(/\D/g, '').slice(-10);
      return Boolean(targetPhone && oPhone && oPhone === targetPhone);
    })
    .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
}
