import { create } from 'zustand';
import type { CartItem } from '@/types';

let toastTimer: ReturnType<typeof setTimeout> | undefined;

interface UiState {
  /** navbar/catalog search text (legacy filters.searchQuery); mirrored to ?q= by SearchUrlSync */
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  toast: string | null;
  toastKind: 'success' | 'error';
  showToast: (msg: string, kind?: 'success' | 'error') => void;

  isCheckoutOpen: boolean;
  quickBuyItem: CartItem | null;
  openCheckout: (quickBuy?: CartItem | null) => void;
  closeCheckout: () => void;

  isCompareOpen: boolean;
  setCompareOpen: (v: boolean) => void;

  isPolicyOpen: boolean;
  setPolicyOpen: (v: boolean) => void;

  isCustomerDashboardOpen: boolean;
  setCustomerDashboardOpen: (v: boolean) => void;

  /** coupon applied in the cart, carried into checkout (legacy appliedDiscount/appliedCoupon) */
  appliedDiscount: number;
  appliedCoupon: string;
  setApplied: (discount: number, code: string) => void;
  clearApplied: () => void;

  /** used by useOverlayHistory to close everything on browser back */
  closeAllOverlays: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  toast: null,
  toastKind: 'success',
  showToast: (msg, kind = 'success') => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: msg, toastKind: kind });
    toastTimer = setTimeout(() => set({ toast: null }), kind === 'error' ? 5200 : 2800);
  },

  isCheckoutOpen: false,
  quickBuyItem: null,
  openCheckout: (quickBuy = null) => set({ isCheckoutOpen: true, quickBuyItem: quickBuy }),
  closeCheckout: () => set({ isCheckoutOpen: false, quickBuyItem: null }),

  isCompareOpen: false,
  setCompareOpen: (v) => set({ isCompareOpen: v }),

  isPolicyOpen: false,
  setPolicyOpen: (v) => set({ isPolicyOpen: v }),

  isCustomerDashboardOpen: false,
  setCustomerDashboardOpen: (v) => set({ isCustomerDashboardOpen: v }),

  appliedDiscount: 0,
  appliedCoupon: '',
  setApplied: (discount, code) => set({ appliedDiscount: discount, appliedCoupon: code }),
  clearApplied: () => set({ appliedDiscount: 0, appliedCoupon: '' }),

  closeAllOverlays: () =>
    set({ isCheckoutOpen: false, quickBuyItem: null, isCompareOpen: false, isPolicyOpen: false, isCustomerDashboardOpen: false }),
}));
