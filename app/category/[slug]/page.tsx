import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getCategoryBySlug, getSettings } from '@/lib/api';
import { categoryMetadata } from '@/lib/seo/metadata';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return {};
  return categoryMetadata(cat, await getSettings());
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat || cat.enabled === false) notFound();
  return (
    <Suspense>
      <CatalogView categoryName={cat.name} />
    </Suspense>
  );
}
