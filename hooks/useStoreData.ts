'use client';

import { useQuery } from '@tanstack/react-query';
import { getCategories, getProducts, getReviews, getSettings } from '@/lib/api';
import type { CategoryItem, Product, ProductReview, StoreSettings } from '@/types';

export const queryKeys = {
  products: ['products'] as const,
  categories: ['categories'] as const,
  settings: ['settings'] as const,
  reviews: ['reviews'] as const,
};

// Data is seeded into the cache by <Providers initialData> from the server render, so these are never `undefined`.
// Phase 1 has no realtime feed (legacy used Firestore onSnapshot); a light refetch keeps the client fresh.
const opts = { staleTime: 60_000, refetchOnWindowFocus: false } as const;

export function useProducts(): Product[] {
  return useQuery({ queryKey: queryKeys.products, queryFn: getProducts, ...opts }).data ?? [];
}
export function useCategories(): CategoryItem[] {
  return useQuery({ queryKey: queryKeys.categories, queryFn: getCategories, ...opts }).data ?? [];
}
export function useSettings(): StoreSettings {
  return useQuery({ queryKey: queryKeys.settings, queryFn: getSettings, ...opts }).data as StoreSettings;
}
export function useReviews(): ProductReview[] {
  return useQuery({ queryKey: queryKeys.reviews, queryFn: () => getReviews(), ...opts }).data ?? [];
}
