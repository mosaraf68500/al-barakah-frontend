'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { Order, Product, ProductReview } from '@/types';
import { createOrder, createReview, sendOrderNotification, toggleWishlistItem } from '@/lib/api';
import { ApiError } from '@/lib/api/http';
import { useAuth } from '@/providers/AuthProvider';
import { productHref } from '@/lib/catalog/urls';
import { trackFbAddToCart, trackFbPurchase } from '@/lib/analytics/facebookPixel';
import { queryKeys } from '@/hooks/useStoreData';
import { useCartStore } from '@/store/cartStore';
import { useCompareStore } from '@/store/compareStore';
import { notify } from '@/lib/ui/notify';
import { useUiStore } from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';

/**
 * The cart / wishlist / compare / checkout / review handlers that lived in legacy `App.tsx`, with the same toast copy,
 * limits and side effects. Components receive these as the same callback props they always had.
 */
export function useStorefrontActions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMemo(() => {
    const addToCart = (product: Product, quantity = 1, color?: string, size?: string, customPrice?: number) => {
      useCartStore.getState().add(product, quantity, color, size, customPrice);
      trackFbAddToCart(product, quantity, customPrice || product.price, 'BDT');
      notify(`"${product.name.slice(0, 28)}" কার্টে যোগ হয়েছে।`);
    };

    const removeItem = (index: number) => {
      useCartStore.getState().remove(index);
      notify('পণ্যটি কার্ট থেকে সরানো হয়েছে।');
    };

    const updateQuantity = (index: number, quantity: number) => {
      if (quantity <= 0) return removeItem(index);
      useCartStore.getState().setQuantity(index, quantity);
      notify('কার্টের পরিমাণ আপডেট হয়েছে।');
    };

    const toggleWishlist = (product: Product) => {
      const added = useWishlistStore.getState().toggle(product);
      const name = product.name?.slice(0, 28) || 'পণ্য';
      const saved = `"${name}" উইশলিস্টে সেভ হয়েছে।`;
      const removed = `"${name}" উইশলিস্ট থেকে সরানো হয়েছে।`;
      if (!user) {
        notify(added ? saved : removed);
        return;
      }
      void toggleWishlistItem(product.id)
        .then((res) => {
          const nowAdded = useWishlistStore.getState().items.some((p) => p.id === product.id);
          if (nowAdded !== res.added) useWishlistStore.getState().toggle(product);
          notify(res.added ? saved : removed);
        })
        .catch(() => {
          useWishlistStore.getState().toggle(product);
          notify('উইশলিস্ট সেভ হয়নি। আবার চেষ্টা করুন।', 'error');
        });
    };

    const toggleCompare = (product: Product) => {
      if (!product || !product.id) return;
      const { result, count } = useCompareStore.getState().toggle(product);
      const prodName = product.name ? product.name.slice(0, 18) : 'পণ্য';
      if (result === 'removed') {
        notify(`"${prodName}" তুলনা তালিকা থেকে সরানো হয়েছে।`);
      } else if (result === 'full') {
        notify('একসাথে সর্বোচ্চ ৩টি পণ্য তুলনা করা যায়।', 'error');
      } else {
        notify(`"${prodName}" তুলনা তালিকায় যোগ হয়েছে (${count}/3)।`);
      }
    };

    const removeFromCompare = (productId: string) => {
      useCompareStore.getState().remove(productId);
      notify('পণ্যটি তুলনা তালিকা থেকে সরানো হয়েছে।');
    };

    const clearCompare = () => {
      useCompareStore.getState().clear();
      notify('তুলনা তালিকা খালি করা হয়েছে।');
    };

    const openProduct = (p: Product) => router.push(productHref(p));

    /** Quick "Buy now": checkout without touching the persistent cart (legacy `handleBuyNow`). */
    const buyNow = (product: Product, quantity = 1, color?: string, size?: string, customPrice?: number) => {
      if (window.location.pathname.startsWith('/product/')) router.push('/');
      useUiStore.getState().openCheckout({ product, quantity, selectedColor: color, selectedSize: size, customPrice });
    };

    /** Legacy `handleOrderPlaced`, minus the admin-only bits. Returns the order the API stored. */
    const placeOrder = async (newOrder: Order) => {
      const saved = await createOrder(newOrder);
      void sendOrderNotification(saved);

      const ui = useUiStore.getState();
      if (!ui.quickBuyItem) useCartStore.getState().clear();
      useUiStore.setState({ quickBuyItem: null });

      trackFbPurchase(saved as any);
      notify(`অর্ডার ${saved.id} সফলভাবে নিশ্চিত হয়েছে।`);
      return saved;
    };

    const addReview = async (data: Omit<ProductReview, 'id' | 'createdAt'>) => {
      if (!user) {
        notify('রিভিউ দিতে আগে লগইন করুন।', 'error');
        throw new Error('LOGIN_REQUIRED');
      }
      try {
        await createReview({
          productId: data.productId,
          productName: data.productName,
          customerName: data.customerName,
          rating: data.rating,
          comment: data.comment,
          verifiedPurchase: data.verifiedPurchase,
          city: data.city,
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.reviews }),
          queryClient.invalidateQueries({ queryKey: queryKeys.products }),
        ]);
        notify('রিভিউ সেভ হয়েছে। Customer Reviews-এ দেখা যাবে।');
      } catch (err) {
        console.error('Error saving review:', err);
        const code = err instanceof ApiError ? err.code || err.message : '';
        const message =
          code === 'ALREADY_REVIEWED'
            ? 'আপনি এই পণ্যে আগেই রিভিউ দিয়েছেন।'
            : code === 'REVIEWS_DISABLED'
              ? 'রিভিউ এখন বন্ধ আছে।'
              : err instanceof ApiError && err.status === 401
                ? 'রিভিউ দিতে আগে লগইন করুন।'
                : 'রিভিউ সেভ হয়নি। আবার চেষ্টা করুন।';
        notify(message, 'error');
        throw err;
      }
    };

    return { addToCart, removeItem, updateQuantity, toggleWishlist, toggleCompare, removeFromCompare, clearCompare, openProduct, buyNow, placeOrder, addReview };
  }, [router, queryClient, user]);
}
