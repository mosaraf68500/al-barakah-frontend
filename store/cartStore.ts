import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { legacyArrayStorage } from './legacyStorage';

interface CartState {
  items: CartItem[];
  add: (product: Product, quantity?: number, color?: string, size?: string, customPrice?: number) => void;
  setQuantity: (index: number, quantity: number) => void;
  remove: (index: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      // Same identity rule as legacy: product id + color + size; quantities merge; a truthy customPrice overwrites.
      add: (product, quantity = 1, color, size, customPrice) =>
        set((s) => {
          const idx = s.items.findIndex((i) => i.product.id === product.id && i.selectedColor === color && i.selectedSize === size);
          if (idx > -1) {
            const items = s.items.map((it, n) =>
              n === idx ? { ...it, quantity: it.quantity + quantity, ...(customPrice ? { customPrice } : {}) } : it
            );
            return { items };
          }
          return { items: [...s.items, { product, quantity, selectedColor: color, selectedSize: size, customPrice }] };
        }),
      setQuantity: (index, quantity) => set((s) => ({ items: s.items.map((it, n) => (n === index ? { ...it, quantity } : it)) })),
      remove: (index) => set((s) => ({ items: s.items.filter((_, n) => n !== index) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'albarakah_premium_cart', storage: createJSONStorage(() => legacyArrayStorage('items')), skipHydration: true }
  )
);
