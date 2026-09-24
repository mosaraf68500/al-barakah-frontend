import type { CustomerIdentity, Order } from '@/types';
import { ApiError, apiFetch } from './http';

function paymentChoice(order: Order): 'FULL_COD' | 'ADVANCE_DELIVERY' | 'FULL_BKASH' {
  if (order.advancePaymentType === 'FULL_PAYMENT') return 'FULL_BKASH';
  if (order.advancePaymentType === 'DELIVERY_ONLY') return 'ADVANCE_DELIVERY';
  return 'FULL_COD';
}

/**
 * Place an order. The server recomputes price, discount and delivery and returns the stored order.
 * The checkout still builds the legacy `Order` object; only the intent fields are sent.
 */
export async function createOrder(order: Order): Promise<Order> {
  // POST /v1/orders responds with `{ order }`, not the order itself. Rendering the wrapper
  // crashes the confirmation screen (`order.customer` is missing).
  const body = await apiFetch<{ order?: Order }>('/v1/orders', {
    method: 'POST',
    body: JSON.stringify({
      items: (order.items ?? []).map((item) => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
        ...(item.selectedSize ? { selectedSize: item.selectedSize } : {}),
        ...(item.selectedColor ? { selectedColor: item.selectedColor } : {}),
      })),
      customer: {
        fullName: order.customer?.fullName || '',
        phone: order.customer?.phone || '',
        email: order.customer?.email || '',
        address: order.customer?.address || '',
        city: order.customer?.city || '',
      },
      paymentChoice: paymentChoice(order),
      ...(order.bkashTrxId ? { bkashTrxId: order.bkashTrxId } : {}),
      ...(order.senderBkashNumber ? { senderBkashNumber: order.senderBkashNumber } : {}),
      ...(order.couponCode ? { couponCode: order.couponCode } : {}),
      ...(order.notes ? { notes: order.notes } : {}),
    }),
  });
  if (!body.order?.id || !body.order.customer) {
    throw new ApiError('অর্ডার সেভ হয়নি। আবার চেষ্টা করুন।', 502, 'BAD_ORDER_RESPONSE');
  }
  return body.order;
}

/** Public order tracking. PII is masked by the API. */
export async function trackOrder(code: string): Promise<Order | null> {
  try {
    return await apiFetch<Order>(`/v1/orders/track/${encodeURIComponent(code.trim())}`);
  } catch {
    return null;
  }
}

/** Orders for the signed-in customer. `identity` is unused: the API reads the JWT. */
export async function getMyOrders(_identity?: CustomerIdentity): Promise<Order[]> {
  try {
    return await apiFetch<Order[]>('/v1/orders/my');
  } catch {
    return [];
  }
}
