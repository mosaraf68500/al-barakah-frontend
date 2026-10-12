/**
 * GA4 E-commerce Data Layer helpers for Google Tag Manager.
 * Client-only pushes — safe to import from Server Components (no-ops on the server).
 * Do not include `gtm.uniqueEventId`; GTM adds it automatically.
 */

export const GTM_CURRENCY = 'BDT' as const;

export type GtmCurrency = typeof GTM_CURRENCY;

/** GA4 item shape used across ecommerce events. */
export interface GtmItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  index?: number;
  discount?: number;
}

export interface ViewItemPayload {
  currency?: GtmCurrency;
  value: number;
  items: GtmItem[];
}

export interface AddToCartPayload {
  currency?: GtmCurrency;
  value: number;
  items: GtmItem[];
}

export interface BeginCheckoutPayload {
  currency?: GtmCurrency;
  value: number;
  items: GtmItem[];
  coupon?: string;
}

/** Non-sensitive order contact fields for analytics match (no passwords/tokens). */
export interface GtmUserData {
  name?: string;
  phone?: string;
  address?: string;
  timestamp?: string;
}

export interface PurchasePayload {
  transaction_id: string;
  value: number;
  currency?: GtmCurrency;
  tax: number;
  shipping: number;
  items: GtmItem[];
  coupon?: string;
  /** Sibling to `ecommerce` on the dataLayer push — not nested inside GA4 ecommerce. */
  user_data?: GtmUserData;
}

type DataLayerEvent =
  | { event: 'view_item'; ecommerce: ViewItemPayload }
  | { event: 'add_to_cart'; ecommerce: AddToCartPayload }
  | { event: 'begin_checkout'; ecommerce: BeginCheckoutPayload }
  | { event: 'purchase'; ecommerce: Omit<PurchasePayload, 'user_data'>; user_data?: GtmUserData };

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function pushToDataLayer(payload: DataLayerEvent): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // Clear previous ecommerce object so GTM/GA4 does not merge stale item data.
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push(payload as unknown as Record<string, unknown>);
}

function withCurrency<T extends { currency?: GtmCurrency }>(
  payload: T,
): T & { currency: GtmCurrency } {
  return { ...payload, currency: payload.currency ?? GTM_CURRENCY };
}

/** GA4 `view_item` — product detail view. */
export function trackViewItem(payload: ViewItemPayload): void {
  pushToDataLayer({ event: 'view_item', ecommerce: withCurrency(payload) });
}

/** GA4 `add_to_cart`. */
export function trackAddToCart(payload: AddToCartPayload): void {
  pushToDataLayer({ event: 'add_to_cart', ecommerce: withCurrency(payload) });
}

/** GA4 `begin_checkout`. */
export function trackBeginCheckout(payload: BeginCheckoutPayload): void {
  pushToDataLayer({ event: 'begin_checkout', ecommerce: withCurrency(payload) });
}

/** GA4 `purchase` — requires transaction_id, value, tax, shipping, items. Optional `user_data` is pushed beside ecommerce. */
export function trackPurchase(payload: PurchasePayload): void {
  const { user_data, ...ecommerce } = payload;
  pushToDataLayer({
    event: 'purchase',
    ecommerce: withCurrency(ecommerce),
    ...(user_data ? { user_data } : {}),
  });
}
