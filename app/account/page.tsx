import type { Metadata } from 'next';
import { AccountPage } from '@/components/account/AccountPage';
import { getSettings } from '@/lib/api';
import { staticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata('account', await getSettings());
}

export default function Page() {
  return <AccountPage />;
}
