import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMyOrders } from '@/lib/api/orders';

const schema = z.object({ email: z.string().optional(), phone: z.string().optional(), userId: z.string().optional() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  return NextResponse.json(await getMyOrders(parsed.data));
}
