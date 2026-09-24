'use client';

import { useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { categoryHref } from '@/lib/catalog/urls';
import { useCategories, useProducts } from '@/hooks/useStoreData';
import { useStorefrontActions } from '@/hooks/useStorefrontActions';
import { useCartStore } from '@/store/cartStore';
import { useCompareStore } from '@/store/compareStore';
import { useUiStore } from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';

const isCatalogPath = (p: string) => p === '/' || p.startsWith('/category/');

/** Wires the (pixel-identical) Navbar to routes + stores; replaces the props `App.tsx` used to pass. */
export function ConnectedNavbar({ onCloseOverride }: { onCloseOverride?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const categories = useCategories();
  const products = useProducts();
  const actions = useStorefrontActions();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const compareCount = useCompareStore((s) => s.items.length);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);
  const navigatingToCategory = useRef(false);

  const selectedCategory = pathname.startsWith('/category/')
    ? categories.find((c) => c.slug === pathname.split('/')[2])?.name ?? 'All'
    : 'All';

  return (
    <Navbar
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      compareCount={compareCount}
      searchQuery={searchQuery}
      onSearchChange={(q) => {
        setSearchQuery(q);
        // Legacy: typing always switched back to the catalog view.
        if (!isCatalogPath(window.location.pathname) && !navigatingToCategory.current) router.push('/');
      }}
      selectedCategory={selectedCategory}
      onSelectCategory={(cat) => {
        navigatingToCategory.current = true;
        setTimeout(() => (navigatingToCategory.current = false), 500);
        router.push(categoryHref(cat, categories));
      }}
      onOpenCart={() => router.push(pathname === '/cart' ? '/' : '/cart')}
      onOpenWishlist={() => router.push('/wishlist')}
      onOpenCompare={() => useUiStore.getState().setCompareOpen(true)}
      onOpenOrders={() => router.push('/track')}
      onOpenAuth={(tab) => router.push(tab === 'TRACK' ? '/track' : '/login')}
      onOpenCustomerDashboard={() => router.push('/account')}
      categories={categories}
      products={products}
      onSelectProduct={(p) => actions.openProduct(p)}
    />
  );
}
