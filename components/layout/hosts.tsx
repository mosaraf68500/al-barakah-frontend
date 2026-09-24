'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { CustomerAuthModal } from '@/components/account/CustomerAuthModal';
import { CartItem } from '@/types';
import { CompareFloatingBar } from '@/components/product/CompareFloatingBar';
import { CompareModal } from '@/components/product/CompareModal';
import { FloatingCartWidget } from '@/components/cart/FloatingCartWidget';
import { FloatingWhatsAppButton } from '@/components/layout/FloatingWhatsAppButton';
import { PolicyModal } from '@/components/layout/PolicyModal';
import { trackFbInitiateCheckout } from '@/lib/analytics/facebookPixel';
import { useProducts, useSettings } from '@/hooks/useStoreData';
import { useStorefrontActions } from '@/hooks/useStorefrontActions';
import { useCartStore } from '@/store/cartStore';
import { useCompareStore } from '@/store/compareStore';
import { useUiStore } from '@/store/uiStore';

const currency = 'BDT' as const;

/* The overlays / floating widgets legacy `App.tsx` mounted at the bottom of its tree, wired to the stores. */

export function CompareHost() {
  const actions = useStorefrontActions();
  const products = useProducts();
  const compareProducts = useCompareStore((s) => s.items);
  const isOpen = useUiStore((s) => s.isCompareOpen);
  const setOpen = useUiStore((s) => s.setCompareOpen);
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
      const subtotal = items.reduce((sum, item) => sum + (item.customPrice ?? item.product.price) * item.quantity, 0);
      trackFbInitiateCheckout(items, Math.max(0, subtotal - appliedDiscount), currency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckoutOpen, quickBuyItem]);

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
  // BUG_FIXES.md #6: legacy dropped the typed tracking code; it is now carried to /track?code=
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
