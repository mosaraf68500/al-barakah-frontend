import type { ReactNode } from 'react';
import { StorefrontChrome } from '@/components/layout/StorefrontChrome';
import { getCategories, getProducts, getReviews, getSettings } from '@/lib/api';
import { Providers } from '@/providers/Providers';

/**
 * Async RSC gate: fetches catalog bootstrap data, then mounts client Providers + chrome.
 * Wrapped in <Suspense> from `app/layout.tsx` so the document shell can stream first.
 */
export async function StoreDataBootstrap({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  const [products, categories, settings, reviews] = await Promise.all([getProducts(), getCategories(), getSettings(), getReviews()]);
  return (
    <Providers initialData={{ products, categories, settings, reviews }}>
      <StorefrontChrome modal={modal}>{children}</StorefrontChrome>
    </Providers>
  );
}
