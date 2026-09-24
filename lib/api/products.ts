import type { Product } from '@/types';
import { apiFetch } from './http';

/** All products. `costPrice` is never included. */
export async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/v1/products');
}

/** Resolve `/product/[slug-or-id]`: id, then slug, then name. */
export async function getProductBySlugOrId(key: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/v1/products/${encodeURIComponent(key)}`);
  } catch {
    return null;
  }
}

export const getProductById = getProductBySlugOrId;
