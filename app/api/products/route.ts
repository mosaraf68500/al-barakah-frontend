import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/api/products';

export async function GET() {
  return NextResponse.json(await getProducts());
}
