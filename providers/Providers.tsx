'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CategoryItem, Product, ProductReview, StoreSettings } from '@/types';
import { queryKeys } from '@/hooks/useStoreData';
import { useCartStore } from '@/store/cartStore';
import { useCompareStore } from '@/store/compareStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { markClientStoresHydrated } from '@/store/clientHydration';
import { AuthProvider } from './AuthProvider';
import { WishlistSync } from './WishlistSync';

export interface InitialStoreData {
  products: Product[];
  categories: CategoryItem[];
  settings: StoreSettings;
  reviews: ProductReview[];
}

// Legacy `App.tsx` deleted these stale business-data keys from every visitor's browser on load.
const LEGACY_KEYS = [
  'albarakah_premium_products',
  'albarakah_premium_categories',
  'albarakah_premium_categories_v3',
  'albarakah_premium_orders',
  'albarakah_premium_reviews',
  'albarakah_premium_staff_list',
  'albarakah_premium_hero_banners',
  'albarakah_premium_courier_config',
  'albarakah_premium_bkash_config',
  'albarakah_premium_delivery_config',
  'albarakah_fb_pixel_config',
  'albarakah_enable_customer_reviews',
];

export function Providers({ initialData, children }: { initialData: InitialStoreData; children: ReactNode }) {
  const [queryClient] = useState(() => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.products, initialData.products);
    qc.setQueryData(queryKeys.categories, initialData.categories);
    qc.setQueryData(queryKeys.settings, initialData.settings);
    qc.setQueryData(queryKeys.reviews, initialData.reviews);
    return qc;
  });

  // Cart/wishlist/compare live in localStorage (skipHydration avoids SSR mismatch): rehydrate once on the client.
  useEffect(() => {
    void (async () => {
      await useCartStore.persist.rehydrate();
      await useWishlistStore.persist.rehydrate();
      await useCompareStore.persist.rehydrate();
      markClientStoresHydrated();
    })();
    try {
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch {
      /* storage unavailable */
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistSync />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
