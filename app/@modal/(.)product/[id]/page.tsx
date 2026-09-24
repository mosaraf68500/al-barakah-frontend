import { notFound } from 'next/navigation';
import { ProductViewContainer } from '@/components/product/ProductViewContainer';
import { getProductBySlugOrId } from '@/lib/api';

/** Client-side navigation from a listing: the product opens as an overlay on top of the catalog (legacy modal behaviour). */
export default async function InterceptedProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductBySlugOrId(id);
  if (!product) notFound();
  return <ProductViewContainer product={product} mode="modal" />;
}
