import { NextResponse } from 'next/server';
import { trackOrder } from '@/lib/api/orders';

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await trackOrder(decodeURIComponent(code));
  if (!order) return NextResponse.json({ error: 'Order not found with this tracking code' }, { status: 404 });
  return NextResponse.json(order);
}
