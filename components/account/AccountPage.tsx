'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerDashboard } from '@/components/account/CustomerDashboardModal';
import { useStorefrontActions } from '@/hooks/useStorefrontActions';
import { useAuth } from '@/providers/AuthProvider';
import { useWishlistStore } from '@/store/wishlistStore';

export function AccountPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const actions = useStorefrontActions();
  const wishlist = useWishlistStore((s) => s.items);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-stone-500">
        অ্যাকাউন্ট লোড হচ্ছে...
      </div>
    );
  }

  return (
    <CustomerDashboard
      orders={[]}
      wishlist={wishlist}
      onRemoveFromWishlist={(productId) => {
        const prod = wishlist.find((p) => p.id === productId);
        if (prod) actions.toggleWishlist(prod);
      }}
      onAddToCart={(p) => actions.addToCart(p, 1)}
      currency="BDT"
      onOpenOrderTrack={(code) => router.push(`/track?code=${encodeURIComponent(code)}`)}
    />
  );
}
