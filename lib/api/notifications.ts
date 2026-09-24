import type { Order } from '@/types';

/**
 * The API sends the owner email, customer email, Telegram alert and Facebook purchase event
 * when the order is created. This function stays so existing callers do not have to change.
 */
export async function sendOrderNotification(_order: Order): Promise<void> {}
