'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { whenClientStoresHydrated } from '@/store/clientHydration';
import { useUiStore } from '@/store/uiStore';

/** Opens the checkout overlay once the cart has rehydrated. Guest checkout — no login required. */
export function CheckoutEntry() {
  const router = useRouter();
  const isCheckoutOpen = useUiStore((s) => s.isCheckoutOpen);
  const opened = useRef(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (opened.current && !isCheckoutOpen) router.replace('/cart');
  }, [isCheckoutOpen, router]);

  return null;
}
