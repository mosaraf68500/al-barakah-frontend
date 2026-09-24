import { ApiError, apiFetch } from './http';

export interface CouponValidation {
  code: string;
  discountPercent: number;
  minSpend: number;
}

/**
 * Asks the API whether this code applies to `subtotal`.
 * Throws `INVALID_COUPON` or `MIN_SPEND:<amount>`, the same strings the cart already shows.
 * `provided` is ignored: the coupon list is no longer shipped to the browser.
 */
export async function validateCoupon(code: string, subtotal: number, _provided?: unknown): Promise<CouponValidation> {
  try {
    return await apiFetch<CouponValidation>('/v1/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  } catch (err) {
    if (err instanceof ApiError && err.code) throw new Error(err.code);
    throw new Error('INVALID_COUPON');
  }
}
