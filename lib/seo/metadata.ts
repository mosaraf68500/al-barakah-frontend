import type { Metadata } from 'next';
import type { CategoryItem, Product, StoreSettings } from '@/types';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const BRAND = 'AL BARAKAH PREMIUM';

/**
 * Per-page metadata replacing the two competing `useEffect`s in legacy App.tsx (MIGRATION_PLAN.md Q7):
 *  - site-level defaults (home page) come from the admin-editable `seoConfig`;
 *  - per-page strings keep the exact hard-coded templates legacy used.
 */
function base(seo: StoreSettings['seoConfig']) {
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.keywords,
    image: seo.ogImage,
    siteName: seo.siteName || 'Al Barakah Premium',
  };
}

function build(o: { title: string; description: string; keywords?: string; image?: string; path: string; type?: 'website'; siteName: string; twitter?: string; noindex?: boolean }): Metadata {
  return {
    title: o.title,
    description: o.description,
    keywords: o.keywords,
    alternates: { canonical: o.path },
    robots: o.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title: o.title, description: o.description, url: o.path, siteName: o.siteName, type: o.type ?? 'website', images: o.image ? [{ url: o.image }] : undefined },
    twitter: { card: 'summary_large_image', title: o.title, description: o.description, images: o.image ? [o.image] : undefined, site: o.twitter },
  };
}

export function homeMetadata(settings: StoreSettings): Metadata {
  const b = base(settings.seoConfig);
  return build({ title: b.title, description: b.description, keywords: b.keywords, image: b.image, path: '/', siteName: b.siteName, twitter: settings.seoConfig.twitterHandle });
}

export function categoryMetadata(cat: CategoryItem, settings: StoreSettings): Metadata {
  const b = base(settings.seoConfig);
  return build({
    title: `${cat.name} Collection | ${BRAND}`,
    description: `Browse authentic ${cat.name} products at best prices with Cash on Delivery all across Bangladesh.`,
    keywords: `${cat.name}, ${BRAND}, Premium Collection, Bangladesh`,
    image: cat.image || b.image,
    path: `/category/${cat.slug}`,
    siteName: b.siteName,
    twitter: settings.seoConfig.twitterHandle,
  });
}

export function productMetadata(p: Product, settings: StoreSettings): Metadata {
  const b = base(settings.seoConfig);
  const description = p.description ? p.description.slice(0, 160) : `Buy authentic ${p.name} at ${BRAND}. 100% pure & premium quality in Bangladesh.`;
  const meta = build({
    title: `${p.name} | ${BRAND}`,
    description,
    keywords: `${p.name}, ${p.category || 'Attar'}, ${BRAND}, Buy Online Bangladesh`,
    image: p.image || b.image,
    path: `/product/${encodeURIComponent(p.slug || p.id)}`,
    siteName: b.siteName,
    twitter: settings.seoConfig.twitterHandle,
  });
  // legacy: og:type = 'product' on product views
  return { ...meta, openGraph: { ...(meta.openGraph as object), type: 'website' } };
}

const STATIC_PAGES = {
  cart: { title: `Shopping Cart | ${BRAND}`, description: `Review your shopping bag and proceed to secure checkout on ${BRAND}.` },
  checkout: { title: `Checkout | ${BRAND}`, description: `Sign in and complete your order on ${BRAND}.` },
  wishlist: { title: `My Wishlist | ${BRAND}`, description: `View your saved favorite perfumes and Islamic lifestyle products on ${BRAND}.` },
  track: { title: `Track Order | ${BRAND}`, description: `Track your parcel and delivery status in real-time with ${BRAND}.` },
  login: { title: `Sign In | ${BRAND}`, description: `Sign in or create your ${BRAND} customer account.` },
  account: { title: `My Account | ${BRAND}`, description: `Your orders, addresses, wishlist, and profile on ${BRAND}.` },
} as const;

export function staticPageMetadata(page: keyof typeof STATIC_PAGES, settings: StoreSettings): Metadata {
  const b = base(settings.seoConfig);
  const s = STATIC_PAGES[page];
  // Transactional / private-ish pages are not for search engines (robots.ts also disallows them).
  return build({ ...s, image: b.image, path: `/${page}`, siteName: b.siteName, twitter: settings.seoConfig.twitterHandle, noindex: true });
}
