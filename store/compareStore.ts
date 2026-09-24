import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Product } from '@/types';
import { legacyArrayStorage } from './legacyStorage';

export const MAX_COMPARE = 3;

type ToggleResult = 'added' | 'removed' | 'full';

interface CompareState {
  items: Product[];
  toggle: (product: Product) => { result: ToggleResult; count: number };
  remove: (productId: string) => void;
  clear: () => void;
}

const valid = (list: unknown): Product[] =>
  Array.isArray(list) ? list.filter((p) => p && typeof p === 'object' && (p as Product).id) : [];

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const safe = valid(get().items);
        if (safe.some((p) => p.id === product.id)) {
          set({ items: safe.filter((p) => p.id !== product.id) });
          return { result: 'removed', count: safe.length - 1 };
        }
        if (safe.length >= MAX_COMPARE) return { result: 'full', count: safe.length };
        set({ items: [...safe, product] });
        return { result: 'added', count: safe.length + 1 };
      },
      remove: (productId) => set((s) => ({ items: s.items.filter((p) => p.id !== productId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'albarakah_premium_compare',
      storage: createJSONStorage(() => legacyArrayStorage('items')),
      skipHydration: true,
      merge: (persisted, current) => ({ ...current, items: valid((persisted as Partial<CompareState> | undefined)?.items) }),
    }
  )
);
