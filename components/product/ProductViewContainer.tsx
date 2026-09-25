'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Product } from '@/types';
import { ProductView } from '@/components/product/ProductView';
import { trackFbViewContent } from '@/lib/analytics/facebookPixel';
import { useCategories, useProducts, useReviews, useSettings } from '@/hooks/useStoreData';
import { useStorefrontActions } from '@/hooks/useStorefrontActions';
import { useCartStore } from '@/store/cartStore';
import { useCompareStore } from '@/store/compareStore';
import { useUiStore } from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';

const currency = 'BDT' as const;

/**
 * Product page. Rendered by BOTH routes so they are identical:
 *  - `app/@modal/(.)product/[id]` (client navigation from a listing -> overlay over the catalog, `mode="modal"`)
 *  - `app/product/[id]` (direct load / refresh / shared link, `mode="page"`)
 * `ProductView` is the legacy ProductModal: a full-screen overlay with its own navbar and breadcrumb.
 */
export function ProductViewContainer({ product: initialProduct, mode }: { product: Product; mode: 'modal' | 'page' }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const actions = useStorefrontActions();
  const allProducts = useProducts();
  const categories = useCategories();
  const reviews = useReviews();
  const settings = useSettings();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const wishlist = useWishlistStore((s) => s.items);
  const compareProducts = useCompareStore((s) => s.items);
  const setCompareOpen = useUiStore((s) => s.setCompareOpen);
  const setPolicyOpen = useUiStore((s) => s.setPolicyOpen);

  // Prefer the live copy (rating/reviewCount change after a review) over the server-rendered prop.
  const product = allProducts.find((p) => p.id === initialProduct.id) ?? initialProduct;

  useEffect(() => {
    trackFbViewContent(product, currency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // Legacy QR-code scan (?verify= / ?product=): toast confirming the product is genuine. Middleware redirects to ?verified=1.
  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      useUiStore.getState().showToast(`✅ ${product.name.slice(0, 28)} — আসল ও খাঁটি পণ্য হিসেবে যাচাই হয়েছে!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => (mode === 'modal' ? router.back() : router.push('/'));

  // A client-side leave from an intercepted product does not clear the @modal slot, so this overlay
  // would stay on top of /track, /wishlist, /cart, and /login. The path is the source of truth.
  // `/product/` is the same prefix as productHref(). A move to another product still matches, so the
  // overlay stays up. The full-page route (mode "page") is the page itself and is not gated here.
  if (mode === 'modal' && !pathname.startsWith('/product/')) return null;

  return (
    <ProductView
      product={product}
      onClose={close}
      currency={currency}
      isWishlisted={wishlist.some((p) => p.id === product.id)}
      onToggleWishlist={actions.toggleWishlist}
      isCompared={compareProducts.some((p) => p.id === product.id)}
      onToggleCompare={actions.toggleCompare}
      onAddToCart={actions.addToCart}
      onBuyNow={actions.buyNow}
      allProducts={allProducts}
      onSelectProduct={actions.openProduct}
      onOpenPolicy={() => setPolicyOpen(true)}
      cartCount={cartCount}
      wishlistCount={wishlist.length}
      compareCount={compareProducts.length}
      onOpenCart={() => router.push('/cart')}
      onOpenWishlist={() => router.push('/wishlist')}
      onOpenCompare={() => setCompareOpen(true)}
      onOpenOrders={() => router.push('/track')}
      onOpenCustomerDashboard={() => router.push('/account')}
      onOpenAuth={(tab) => router.push(tab === 'TRACK' ? '/track' : '/login')}
      categories={categories}
      enableCustomerReviews={settings.enableCustomerReviews}
      reviews={reviews}
      onAddReview={actions.addReview}
    />
  );
}
