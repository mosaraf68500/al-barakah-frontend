import type { Metadata } from 'next';
import { Suspense } from 'react';
import { WishlistPage } from '@/components/wishlist/WishlistPage';
import { getSettings } from '@/lib/api';
import { staticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata('wishlist', await getSettings());
}

export default function Page() {
  return <WishlistPage />;
}
