'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CartItem } from '@/types';
import { CompareFloatingBar } from '@/components/product/CompareFloatingBar';
import { FloatingCartWidget } from '@/components/cart/FloatingCartWidget';
import { FloatingWhatsAppButton } from '@/components/layout/FloatingWhatsAppButton';
import { trackFbInitiateCheckout } from '@/lib/analytics/facebookPixel';
import { trackBeginCheckout } from '@/lib/gtm';
import { useProducts, useSettings } from '@/hooks/useStoreData';
import { useStorefrontActions } from '@/hooks/useStorefrontActions';
import { useAuth } from '@/providers/AuthProvider';
import { useCartStore } from '@/store/cartStore';
import { useCompareStore } from '@/store/compareStore';
import { useUiStore } from '@/store/uiStore';

const currency = 'BDT' as const;

/** Heavy overlays — code-split so the first homepage paint does not download checkout/auth/compare JS. */
const CompareModal = dynamic(() => import('@/components/product/CompareModal').then((m) => m.CompareModal), {
  ssr: false,
});
const PolicyModal = dynamic(() => import('@/components/layout/PolicyModal').then((m) => m.PolicyModal), {
  ssr: false,
});
const CheckoutModal = dynamic(() => import('@/components/checkout/CheckoutModal').then((m) => m.CheckoutModal), {
  ssr: false,
});
const CustomerAuthModal = dynamic(() => import('@/components/account/CustomerAuthModal').then((m) => m.CustomerAuthModal), {
  ssr: false,
});

/* The overlays / floating widgets legacy `App.tsx` mounted at the bottom of its tree, wired to the stores. */

export function CompareHost() {
  const actions = useStorefrontActions();
  const products = useProducts();
  const compareProducts = useCompareStore((s) => s.items);
  const isOpen = useUiStore((s) => s.isCompareOpen);
  const setOpen = useUiStore((s) => s.setCompareOpen);
  if (!isOpen) return null;
  return (
    <CompareModal
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      compareProducts={compareProducts}
      allProducts={products}
      onRemoveProduct={actions.removeFromCompare}
      onClearAll={actions.clearCompare}
      onAddProduct={actions.toggleCompare}
      onAddToCart={(p, qty) => actions.addToCart(p, qty)}
      onBuyNow={(p, qty) => {
        setOpen(false);
        actions.buyNow(p, qty);
      }}
      onSelectProduct={(p) => {
        setOpen(false);
        actions.openProduct(p);
      }}
      currency={currency}
    />
  );
}

export function PolicyHost() {
  const isOpen = useUiStore((s) => s.isPolicyOpen);
  const setOpen = useUiStore((s) => s.setPolicyOpen);
  if (!isOpen) return null;
  return <PolicyModal isOpen={isOpen} onClose={() => setOpen(false)} />;
}

export function CheckoutHost() {
  const actions = useStorefrontActions();
  const settings = useSettings();
  const cart = useCartStore((s) => s.items);
  const { isCheckoutOpen, quickBuyItem, appliedDiscount, appliedCoupon, closeCheckout } = useUiStore();
  const items: CartItem[] = quickBuyItem ? [quickBuyItem] : cart;

  // Legacy: InitiateCheckout fires when checkout opens with items.
  useEffect(() => {
    if (isCheckoutOpen && items.length > 0) {
      const gtmItems = items.map((item, index) => {
        const unitPrice = item.customPrice ?? item.product.price;
        const original = item.product.originalPrice;
        const discount =
          original !== undefined && original > unitPrice
            ? Number((original - unitPrice).toFixed(2))
            : undefined;
        return {
          item_id: item.product.id,
          item_name: item.product.name,
          price: unitPrice,
          quantity: item.quantity,
          index,
          ...(discount !== undefined ? { discount } : {}),
        };
      });
      const value = Math.max(
        0,
        gtmItems.reduce((sum, item) => sum + item.price * item.quantity, 0) - appliedDiscount,
      );

      trackFbInitiateCheckout(items, value, currency);
      trackBeginCheckout({
        value,
        items: gtmItems,
        ...(appliedCoupon ? { coupon: appliedCoupon } : {}),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckoutOpen, quickBuyItem]);

  if (!isCheckoutOpen) return null;

  return (
    <CheckoutModal
      isOpen={isCheckoutOpen}
      onClose={closeCheckout}
      items={items}
      discountPercent={settings.enableCoupons ? appliedDiscount : 0}
      promoCode={settings.enableCoupons ? appliedCoupon : ''}
      onOrderPlaced={actions.placeOrder}
      currency={currency}
      deliveryConfig={settings.deliveryConfig}
      bkashConfig={settings.bkashConfig}
      enableCoupons={settings.enableCoupons}
    />
  );
}

export function CustomerAuthHost() {
  const router = useRouter();
  const { isAuthModalOpen } = useAuth();
  // BUG_FIXES.md #6: legacy dropped the typed tracking code; it is now carried to /track?code=
  if (!isAuthModalOpen) return null;
  return <CustomerAuthModal onOpenOrderTrack={(code) => router.push(`/track?code=${encodeURIComponent(code)}`)} />;
}

export function FloatingHosts() {
  const router = useRouter();
  const actions = useStorefrontActions();
  const settings = useSettings();
  const cart = useCartStore((s) => s.items);
  const compareProducts = useCompareStore((s) => s.items);
  const setCompareOpen = useUiStore((s) => s.setCompareOpen);
  return (
    <>
      <CompareFloatingBar
        compareProducts={compareProducts}
        onOpenCompareModal={() => setCompareOpen(true)}
        onOpenCompare={() => setCompareOpen(true)}
        onRemoveProduct={actions.removeFromCompare}
        onClearAll={actions.clearCompare}
      />
      <FloatingCartWidget cart={cart} currency={currency} onOpenCart={() => router.push('/cart')} />
      <FloatingWhatsAppButton phoneNumber={settings.bkashConfig.personalNumber || '01316534171'} shopName="Al Barakah Premium" />
    </>
  );
}
