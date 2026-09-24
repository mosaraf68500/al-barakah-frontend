import type { Product } from '@/types';
import { apiFetch } from './http';

/** Signed-in customer's wishlist, newest first. */
export async function getWishlist(): Promise<Product[]> {
  const list = await apiFetch<Product[]>('/v1/wishlist');
  return Array.isArray(list) ? list : [];
}

/** Toggle membership. `{ added: true }` means the product is now on the wishlist. */
export async function toggleWishlistItem(productId: string): Promise<{ added: boolean }> {
  return apiFetch<{ added: boolean }>(`/v1/wishlist/${encodeURIComponent(productId)}`, { method: 'POST' });
}
