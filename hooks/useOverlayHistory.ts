'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';

/**
 * Port of the legacy mobile back-button controller for overlays (checkout / compare / policy / customer dashboard):
 * opening one pushes a history entry, and browser/mobile back closes it instead of leaving the site.
 * (Product view, cart, track, login and wishlist are real routes now, so the router handles them.)
 */
export function useOverlayHistory() {
  const anyOpen = useUiStore((s) => s.isCheckoutOpen || s.isCompareOpen || s.isPolicyOpen || s.isCustomerDashboardOpen);

  useEffect(() => {
    if (anyOpen) window.history.pushState(window.history.state, '', window.location.href);
  }, [anyOpen]);

  useEffect(() => {
    const onPop = () => useUiStore.getState().closeAllOverlays();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
}
