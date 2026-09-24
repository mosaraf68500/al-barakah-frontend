import type { StateStorage } from 'zustand/middleware';

/**
 * Legacy `App.tsx` persisted cart/wishlist/compare as a bare JSON array under fixed localStorage keys
 * (albarakah_premium_cart | _wishlist | _compare). Zustand's persist wraps state in {state, version}; this adapter maps
 * between the two so EXISTING customers keep their carts/wishlists after the migration.
 */
export function legacyArrayStorage(field: string): StateStorage {
  return {
    getItem: (name) => {
      try {
        const raw = localStorage.getItem(name);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return JSON.stringify({ state: { [field]: parsed }, version: 0 });
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        const { state } = JSON.parse(value);
        localStorage.setItem(name, JSON.stringify(state[field] ?? []));
      } catch {
        /* storage unavailable */
      }
    },
    removeItem: (name) => {
      try {
        localStorage.removeItem(name);
      } catch {
        /* storage unavailable */
      }
    },
  };
}
