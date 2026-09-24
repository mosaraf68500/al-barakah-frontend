'use client';

import { useEffect, useRef } from 'react';
import { getWishlist, toggleWishlistItem } from '@/lib/api/wishlist';
import { whenClientStoresHydrated } from '@/store/clientHydration';
import { useWishlistStore } from '@/store/wishlistStore';
import { notify } from '@/lib/ui/notify';
import { useAuth } from './AuthProvider';

/**
 * When a customer is signed in, the wishlist in the database is the source of truth.
 * Items saved in this browser before login are uploaded once, then the store is replaced
 * with the server list. Signing out clears the in-memory list so the next account does not inherit it.
 */
export function WishlistSync() {
  const { user, loading } = useAuth();
  const lastUid = useRef<string | null>(null);
  const gen = useRef(0);

  useEffect(() => {
    if (loading) return;
    const id = ++gen.current;
    const uid = user?.uid ?? null;
    const previous = lastUid.current;

    void (async () => {
      await whenClientStoresHydrated();
      if (gen.current !== id) return;

      if (!uid) {
        if (previous) useWishlistStore.getState().replace([]);
        lastUid.current = null;
        return;
      }
      if (previous === uid) return;

      const local = previous == null ? useWishlistStore.getState().items : [];
      try {
        let remote = await getWishlist();
        const remoteIds = new Set(remote.map((p) => p.id));
        let uploaded = false;
        for (const item of local) {
          if (!item.id || remoteIds.has(item.id)) continue;
          try {
            await toggleWishlistItem(item.id);
            uploaded = true;
          } catch {
            /* product removed from the catalog */
          }
        }
        if (uploaded) remote = await getWishlist();
        if (gen.current !== id) return;
        useWishlistStore.getState().replace(remote);
        lastUid.current = uid;
      } catch {
        if (gen.current === id) notify('উইশলিস্ট লোড হয়নি। পরে আবার চেষ্টা করুন।', 'error');
      }
    })();
  }, [user, loading]);

  return null;
}
