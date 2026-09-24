import type { CategoryItem, Product } from '@/types';

/** `/category/[slug]` for a category *name* (legacy filtered by name); 'All' or unknown names fall back to search-free home. */
export function categoryHref(name: string, categories: CategoryItem[]): string {
  if (!name || name === 'All') return '/';
  const cat = categories.find((c) => c.name === name || c.name.toLowerCase() === name.toLowerCase());
  return cat ? `/category/${cat.slug}` : `/?q=${encodeURIComponent(name)}`;
}

/** Canonical product URL: slug when present, else Firestore-era id. */
export function productHref(p: Pick<Product, 'id' | 'slug'>): string {
  return `/product/${encodeURIComponent(p.slug || p.id)}`;
}
