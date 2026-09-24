import type { Product } from '@/types';
import { SITE_URL } from './metadata';

export function productJsonLd(p: Product) {
  const url = `${SITE_URL}/product/${encodeURIComponent(p.slug || p.id)}`;
  const abs = (u: string) => (u.startsWith('/') ? `${SITE_URL}${u}` : u);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description?.slice(0, 500),
    image: (p.images?.length ? p.images : [p.image]).filter(Boolean).map(abs),
    sku: p.sku || p.id,
    brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
    url,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: p.price,
      availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
    },
    aggregateRating: p.reviewCount > 0 ? { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviewCount } : undefined,
  };
}
