import { NextResponse } from 'next/server';
import { getProductBySlugOrId } from '@/lib/api/products';

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const product = await getProductBySlugOrId(key);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json(product);
}
