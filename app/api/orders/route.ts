import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createOrder } from '@/lib/api/orders';
import type { Order } from '@/types';

// TEMP: Phase 1 only - minimal boundary validation; Phase 3 backend validates + recomputes totals server-side.
const orderSchema = z
  .object({
    id: z.string().min(1).max(64),
    items: z.array(z.record(z.any())).min(1).max(100),
    total: z.number().nonnegative(),
    customer: z.object({ fullName: z.string().min(1).max(200), phone: z.string().min(5).max(40), address: z.string().min(1).max(1000) }).passthrough(),
    createdAt: z.string(),
  })
  .passthrough();

export async function POST(req: Request) {
  const parsed = orderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });
  const order = await createOrder(parsed.data as unknown as Order);
  return NextResponse.json({ success: true, order }, { status: 201 });
}
