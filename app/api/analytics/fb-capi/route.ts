import { NextResponse } from 'next/server';
import { getFacebookConfigWithSecret } from '@/lib/server/publicViews';

/**
 * TEMP: Phase 1 only. Server-side Facebook Conversions API relay (legacy called graph.facebook.com from the browser
 * with the access token in the URL - SECURITY_RISKS.md #5). Off unless ENABLE_LIVE_INTEGRATIONS=true, because events
 * from this snapshot app must not pollute the production pixel. Never errors to the caller.
 */
export async function POST(req: Request) {
  if (process.env.ENABLE_LIVE_INTEGRATIONS !== 'true') return NextResponse.json({ skipped: true });
  try {
    const cfg = getFacebookConfigWithSecret();
    if (!cfg.enabled || !cfg.enableCapi || !cfg.pixelId || !cfg.accessToken) return NextResponse.json({ skipped: true });
    const payload = (await req.json()) as Record<string, unknown>;
    if (cfg.testEventCode?.trim()) payload.test_event_code = cfg.testEventCode.trim();
    const res = await fetch(`https://graph.facebook.com/v19.0/${cfg.pixelId.trim()}/events?access_token=${cfg.accessToken.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    return NextResponse.json({ ok: res.ok });
  } catch (err) {
    console.warn('[fb-capi] relay failed (ignored):', (err as Error).message);
    return NextResponse.json({ ok: false });
  }
}
