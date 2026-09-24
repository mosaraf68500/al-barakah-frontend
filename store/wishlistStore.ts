import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Product } from '@/types';
import { legacyArrayStorage } from './legacyStorage';

interface WishlistState {
  items: Product[];
  /** returns true when the product was added, false when removed */
  toggle: (product: Product) => boolean;
  replace: (items: Product[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.some((p) => p.id === product.id);
        set((s) => ({ items: exists ? s.items.filter((p) => p.id !== product.id) : [...s.items, product] }));
        return !exists;
      },
      replace: (items) => set({ items }),
    }),
    { name: 'albarakah_premium_wishlist', storage: createJSONStorage(() => legacyArrayStorage('items')), skipHydration: true }
  )
);
