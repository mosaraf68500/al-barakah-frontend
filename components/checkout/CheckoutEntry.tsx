'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CHECKOUT_PATH } from '@/lib/auth/returnTo';
import { useAuth } from '@/providers/AuthProvider';
import { whenClientStoresHydrated } from '@/store/clientHydration';
import { useUiStore } from '@/store/uiStore';

/** Opens the existing checkout overlay once the customer is signed in and the cart has rehydrated. */
export function CheckoutEntry() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isCheckoutOpen = useUiStore((s) => s.isCheckoutOpen);
  const opened = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?returnTo=${encodeURIComponent(CHECKOUT_PATH)}`);
      return;
    }
    let cancel = false;
    void whenClientStoresHydrated().then(() => {
      if (cancel) return;
      const ui = useUiStore.getState();
      ui.openCheckout(ui.quickBuyItem);
      opened.current = true;
    });
    return () => {
      cancel = true;
    };
  }, [loading, user, router]);

  useEffect(() => {
    if (opened.current && !isCheckoutOpen) router.replace('/cart');
  }, [isCheckoutOpen, router]);

  return null;
}
