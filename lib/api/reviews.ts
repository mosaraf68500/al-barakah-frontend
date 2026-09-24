import type { ProductReview, ReviewInput } from '@/types';
import { apiFetch } from './http';

export async function getReviews(productId?: string): Promise<ProductReview[]> {
  const q = productId ? `?productId=${encodeURIComponent(productId)}` : '';
  return apiFetch<ProductReview[]>(`/v1/reviews${q}`);
}

/** Logged-in customers only. The API sets the author, the id, and whether the purchase was verified. */
export async function createReview(input: ReviewInput): Promise<ProductReview> {
  return apiFetch<ProductReview>('/v1/reviews', {
    method: 'POST',
    body: JSON.stringify({
      productId: input.productId,
      rating: input.rating,
      comment: input.comment,
      ...(input.city ? { city: input.city } : {}),
    }),
  });
}
