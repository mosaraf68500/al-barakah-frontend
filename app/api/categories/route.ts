import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/api/categories';

export async function GET() {
  return NextResponse.json(await getCategories());
}
