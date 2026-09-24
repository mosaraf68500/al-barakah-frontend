import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductViewContainer } from '@/components/product/ProductViewContainer';
import { getProductBySlugOrId, getSettings } from '@/lib/api';
import { productJsonLd } from '@/lib/seo/jsonLd';
import { productMetadata } from '@/lib/seo/metadata';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductBySlugOrId(id);
  if (!product) return {};
  return productMetadata(product, await getSettings());
}

/** Direct load / refresh / shared link: the same view as the intercepted modal, server-rendered for crawlers. */
export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  const product = await getProductBySlugOrId(id);
  if (!product) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)).replace(/</g, '\\u003c') }} />
      <ProductViewContainer product={product} mode="page" />
    </>
  );
}
