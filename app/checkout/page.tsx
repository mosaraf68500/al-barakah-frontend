import type { Metadata } from 'next';
import { CheckoutEntry } from '@/components/checkout/CheckoutEntry';
import { getSettings } from '@/lib/api';
import { staticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata('checkout', await getSettings());
}

export default function Page() {
  return <CheckoutEntry />;
}
