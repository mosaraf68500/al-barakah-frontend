import type { MetadataRoute } from 'next';
import { getCategories, getProducts } from '@/lib/api';
import { SITE_URL } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    ...categories.filter((c) => c.enabled).map((c) => ({ url: `${SITE_URL}/category/${c.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${SITE_URL}/product/${encodeURIComponent(p.slug || p.id)}`, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ];
}
