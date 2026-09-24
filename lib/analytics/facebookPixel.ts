import type { FacebookPixelConfig } from '@/types';
import { sendFacebookCapiEvent } from '@/lib/api/analytics';

/**
 * Storefront port of legacy services/facebookPixelService.ts (init + the 5 standard events, same event payloads/ids).
 * Not ported (admin-only, see ADMIN_FEATURES_FOR_PHASE2.md): the event-log viewer/localStorage log, test-event sender.
 * Changes: (1) CAPI goes through our server relay (token never in the browser); (2) the whole thing is OFF unless
 * NEXT_PUBLIC_ENABLE_FB_PIXEL=true, because this app runs on a data snapshot and must not feed the production pixel.
 */

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

const ENABLED = process.env.NEXT_PUBLIC_ENABLE_FB_PIXEL === 'true';

let activeConfig: FacebookPixelConfig | null = null;
let initializedPixelId = '';

export const initFacebookPixel = (config: FacebookPixelConfig) => {
  if (!ENABLED || typeof window === 'undefined') return;
  activeConfig = { ...config };
  const pixelId = config.pixelId?.trim();
  if (!config.enabled || !pixelId) return;
  if (initializedPixelId === pixelId) return;

  /* eslint-disable */
  if (!window.fbq) {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      if (s && s.parentNode) s.parentNode.insertBefore(t, s);
      else b.head.appendChild(t);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  }
  /* eslint-enable */

  try {
    window.fbq('init', pixelId);
    initializedPixelId = pixelId;
    if (config.trackPageView) window.fbq('track', 'PageView');
  } catch (e) {
    console.warn('Facebook Pixel init warning:', e);
  }
};

const capi = (eventName: string, eventId: string, customData: Record<string, any>, userData: Record<string, any> = {}) => {
  if (!ENABLED || !activeConfig?.enableCapi) return;
  void sendFacebookCapiEvent({
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: window.location.href,
        action_source: 'website',
        user_data: { client_user_agent: navigator.userAgent, ...userData },
        custom_data: customData,
      },
    ],
  });
};

const fire = (name: string, data: Record<string, any> | undefined, eventId: string) => {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', name, data, { eventID: eventId });
};

export const trackFbPageView = (pageName?: string) => {
  if (!ENABLED || !activeConfig?.enabled || !activeConfig.trackPageView) return;
  const eventId = `pv-${Date.now()}`;
  fire('PageView', { page: pageName || window.location.pathname }, eventId);
};

export const trackFbViewContent = (product: { id: string; name: string; price: number; category?: string; currency?: string }, currencyParam?: string) => {
  if (!ENABLED || !activeConfig?.enabled || !activeConfig.trackViewContent) return;
  const eventId = `vc-${product.id}-${Date.now()}`;
  const customData = {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    content_category: product.category || 'General',
    value: product.price,
    currency: currencyParam || product.currency || activeConfig.customCurrency || 'BDT',
  };
  fire('ViewContent', customData, eventId);
  capi('ViewContent', eventId, customData);
};

export const trackFbAddToCart = (
  product: { id: string; name: string; price: number; quantity?: number; category?: string; currency?: string },
  quantityParam?: number,
  priceParam?: number,
  currencyParam?: string
) => {
  if (!ENABLED || !activeConfig?.enabled || !activeConfig.trackAddToCart) return;
  const qty = quantityParam !== undefined ? quantityParam : product.quantity || 1;
  const price = priceParam !== undefined ? priceParam : product.price;
  const eventId = `atc-${product.id}-${Date.now()}`;
  const customData = {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    content_category: product.category || 'General',
    value: price * qty,
    currency: currencyParam || product.currency || activeConfig.customCurrency || 'BDT',
    num_items: qty,
  };
  fire('AddToCart', customData, eventId);
  capi('AddToCart', eventId, customData);
};

export const trackFbInitiateCheckout = (items: Array<any>, totalAmount: number, currency: string = 'BDT') => {
  if (!ENABLED || !activeConfig?.enabled || !activeConfig.trackInitiateCheckout) return;
  const eventId = `ic-${Date.now()}`;
  const customData = {
    content_ids: items.map((i) => i.id || i.product?.id || ''),
    content_type: 'product',
    value: totalAmount,
    currency: currency || activeConfig.customCurrency || 'BDT',
    num_items: items.reduce((acc, item) => acc + (item.quantity || 1), 0),
  };
  fire('InitiateCheckout', customData, eventId);
  capi('InitiateCheckout', eventId, customData);
};

export const trackFbPurchase = (order: {
  id: string;
  totalAmount?: number;
  subtotalAmount?: number;
  total?: number;
  currency?: string;
  items?: Array<{ id?: string; name: string; price: number; quantity?: number }>;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customer?: any;
}) => {
  if (!ENABLED || !activeConfig?.enabled || !activeConfig.trackPurchase) return;
  const orderValue = order.totalAmount ?? order.total ?? order.subtotalAmount ?? 0;
  const eventId = `pur-${order.id}`;
  const items = order.items || [];
  const contentIds = items.map((item) => item.id || 'item');
  const customData = {
    content_ids: contentIds.length > 0 ? contentIds : [order.id],
    content_type: 'product',
    value: orderValue,
    currency: order.currency || activeConfig.customCurrency || 'BDT',
    num_items: items.reduce((acc, item) => acc + (item.quantity || 1), 1),
    order_id: order.id,
  };
  const userData: Record<string, any> = {};
  const phone = order.customerPhone || order.customer?.phone;
  const email = order.customerEmail || order.customer?.email;
  const name = order.customerName || order.customer?.fullName;
  if (phone) userData.ph = phone.replace(/[^0-9+]/g, '');
  if (email) userData.em = email.trim().toLowerCase();
  if (name) userData.fn = name.trim();
  fire('Purchase', customData, eventId);
  capi('Purchase', eventId, customData, userData);
};
