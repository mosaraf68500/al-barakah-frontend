// NOTE: no `server-only` import on purpose - client components are SSR-compiled too and legitimately run this code on
// the server. The browser bundle never contains it: `typeof window === 'undefined'` branches in lib/api/* are dead-code-eliminated.
import type { Order } from '@/types';

const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Ported from legacy utils/telegramNotifier.ts `formatOrderForTelegram` (same Bengali copy/layout).
 * Difference: user-supplied values are HTML-escaped (legacy interpolated them raw into a parse_mode=HTML message).
 * TEMP: Phase 1 only - moves into the backend notifications module in Phase 3.
 */
export function formatOrderForTelegram(order: Order): string {
  const orderId = order.trackingCode || order.id;
  const customerName = order.customerName || order.customer?.fullName || 'সম্মানিত গ্রাহক';
  const customerPhone = order.customerPhone || order.customer?.phone || 'N/A';
  const address = order.deliveryAddress || order.customer?.address || 'N/A';
  const cityRaw = order.cityDistrict || order.customer?.city;
  const city = cityRaw ? ` (${cityRaw})` : '';
  const total = Number(order.totalAmount ?? order.total ?? 0).toLocaleString();
  const paymentMethod = order.paymentMethod || 'Cash On Delivery';
  const paymentStatus = order.deliveryPaymentStatus || order.paymentStatus || 'Pending';
  const notes = order.notes ? `\n📝 <b>নোট:</b> <i>"${esc(order.notes)}"</i>` : '';

  let itemsText: string;
  if (Array.isArray(order.items) && order.items.length > 0) {
    itemsText = order.items
      .map((it: any, index: number) => {
        const name = it.name || it.productNameSnapshot || 'Product';
        const qty = it.quantity || 1;
        const price = Number(it.price || it.unitPrice || 0).toLocaleString();
        const variant = it.selectedColor || it.selectedSize ? ` [${[it.selectedColor, it.selectedSize].filter(Boolean).join(', ')}]` : '';
        return `  ${index + 1}. <b>${esc(name)}</b>${esc(variant)} x ${qty} = ৳${price}`;
      })
      .join('\n');
  } else {
    itemsText = '  • পণ্য বিবরণ সংরক্ষিত';
  }

  return `🎉 <b>নতুন অর্ডার এসেছে! [AL BARAKAH PREMIUM]</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>অর্ডার আইডি:</b> #${esc(orderId)}
👤 <b>গ্রাহকের নাম:</b> ${esc(customerName)}
📞 <b>মোবাইল নম্বর:</b> <code>${esc(customerPhone)}</code>
📍 <b>ঠিকানা:</b> ${esc(address)}${esc(city)}
💰 <b>মোট বিল:</b> ৳${total} (${esc(paymentMethod)})
💳 <b>পেমেন্ট স্ট্যাটাস:</b> ${esc(paymentStatus)}${notes}

🛍️ <b>অর্ডারকৃত পণ্যসমূহ:</b>
${itemsText}
━━━━━━━━━━━━━━━━━━━━
⏰ <i>${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}</i>
👉 <i>অর্ডার প্রসেস করতে অ্যাডমিন ড্যাশবোর্ডে লগইন করুন</i>`;
}
