'use client';

import { useRouter } from 'next/navigation';
import { WishlistView } from '@/components/wishlist/WishlistView';
import { useStorefrontActions } from '@/hooks/useStorefrontActions';
import { useWishlistStore } from '@/store/wishlistStore';

export function WishlistPage() {
  const router = useRouter();
  const actions = useStorefrontActions();
  const wishlist = useWishlistStore((s) => s.items);
  return (
    <WishlistView
      wishlist={wishlist}
      onClose={() => router.push('/')}
      onRemoveFromWishlist={actions.toggleWishlist}
      onAddToCart={(p) => actions.addToCart(p, 1)}
      onQuickView={actions.openProduct}
      onDirectBuy={(p) => actions.buyNow(p, 1)}
      currency="BDT"
      onOpenAuth={() => router.push('/login')}
    />
  );
}
