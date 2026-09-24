'use client';

import { useRouter } from 'next/navigation';
import { CartView } from '@/components/cart/CartView';
import { useSettings } from '@/hooks/useStoreData';
import { useStorefrontActions } from '@/hooks/useStorefrontActions';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';

export function CartPage() {
  const router = useRouter();
  const actions = useStorefrontActions();
  const settings = useSettings();
  const items = useCartStore((s) => s.items);
  return (
    <CartView
      items={items}
      onClose={() => router.push('/')}
      onUpdateQuantity={actions.updateQuantity}
      onRemoveItem={actions.removeItem}
      onProceedCheckout={(discount, code) => {
        useUiStore.getState().setApplied(discount, code);
        useUiStore.getState().openCheckout(null);
      }}
      currency="BDT"
      deliveryConfig={settings.deliveryConfig}
      enableCoupons={settings.enableCoupons}
      activeCoupons={settings.coupons}
    />
  );
}
