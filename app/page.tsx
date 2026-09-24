import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getSettings } from '@/lib/api';
import { homeMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return homeMetadata(await getSettings());
}

export default function HomePage() {
  return (
    <Suspense>
      <CatalogView />
    </Suspense>
  );
}
