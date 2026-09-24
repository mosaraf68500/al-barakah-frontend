import { NextResponse } from 'next/server';
import type { Order } from '@/types';
import { getTelegramConfigWithSecret } from '@/lib/server/publicViews';
import { formatOrderForTelegram } from '@/lib/server/telegramFormat';

/**
 * TEMP: Phase 1 only. Best-effort relay to the legacy Express server (order e-mail + Telegram).
 * The legacy server is down/unreliable and this app runs on a data snapshot, so:
 *  - it does nothing unless ENABLE_LIVE_INTEGRATIONS=true AND LEGACY_API_URL is set;
 *  - every upstream call is try/catch + timeout and only logs a warning;
 *  - it ALWAYS answers 200 so the order flow can never be blocked or failed by it.
 * The Telegram bot token stays on the server (legacy sent it from every visitor's browser - SECURITY_RISKS.md #2).
 */
async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function POST(req: Request) {
  const base = process.env.LEGACY_API_URL?.replace(/\/$/, '');
  if (process.env.ENABLE_LIVE_INTEGRATIONS !== 'true' || !base) return NextResponse.json({ skipped: true });

  const order = (await req.json().catch(() => null)) as Order | null;
  if (!order) return NextResponse.json({ skipped: true });

  try {
    await post(`${base}/api/notify-order`, order);
  } catch (err) {
    console.warn('[notify-order] legacy server unreachable (ignored):', (err as Error).message);
  }

  try {
    const tg = getTelegramConfigWithSecret();
    if (tg) await post(`${base}/api/notify-telegram`, { botToken: tg.botToken, chatId: tg.chatId, message: formatOrderForTelegram(order), orderId: order.id });
  } catch (err) {
    console.warn('[notify-telegram] legacy server unreachable (ignored):', (err as Error).message);
  }
  return NextResponse.json({ ok: true });
}
