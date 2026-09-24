import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createReview, getReviews } from '@/lib/api/reviews';

const schema = z.object({
  productId: z.string().min(1),
  productName: z.string().optional(),
  customerName: z.string().min(1).max(120),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(3000),
  verifiedPurchase: z.boolean().optional(),
  city: z.string().max(120).optional(),
});

export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get('productId') ?? undefined;
  return NextResponse.json(await getReviews(productId));
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid review' }, { status: 400 });
  return NextResponse.json({ review: await createReview(parsed.data) }, { status: 201 });
}
