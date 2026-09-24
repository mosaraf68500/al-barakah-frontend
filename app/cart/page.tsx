import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CartPage } from '@/components/cart/CartPage';
import { getSettings } from '@/lib/api';
import { staticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata('cart', await getSettings());
}

export default function Page() {
  return <CartPage />;
}
