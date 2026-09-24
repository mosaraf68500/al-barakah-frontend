import type { CategoryItem } from '@/types';
import { apiFetch } from './http';

/** All categories sorted by `order` (enabled and disabled — the UI filters `enabled`). */
export async function getCategories(): Promise<CategoryItem[]> {
  return apiFetch<CategoryItem[]>('/v1/categories');
}

export async function getCategoryBySlug(slug: string): Promise<CategoryItem | null> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
}
