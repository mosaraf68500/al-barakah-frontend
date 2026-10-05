'use client';

import { useState, type MouseEvent } from 'react';
import { ArrowLeftRight, Check, Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '@/types';

type Shared = {
  product: Product;
  isOutOfStock: boolean;
  isWishlisted?: boolean;
  isCompared?: boolean;
  onToggleWishlist?: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
};

/** Top-right wishlist / compare buttons (absolute inside image box). */
export function ProductCardIconActions({
  product,
  isWishlisted = false,
  isCompared = false,
  onToggleWishlist,
  onToggleCompare,
}: Pick<Shared, 'product' | 'isWishlisted' | 'isCompared' | 'onToggleWishlist' | 'onToggleCompare'>) {
  return (
    <div className="absolute top-1.5 right-1.5 z-10 flex flex-col gap-1.5">
      {onToggleWishlist && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isWishlisted ? 'bg-rose-500 text-white shadow-xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-rose-500'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      )}
      {onToggleCompare && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(product);
          }}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isCompared ? 'bg-[#f38018] text-white shadow-xs' : 'bg-stone-100/90 hover:bg-stone-200 text-stone-600 hover:text-[#f38018]'
          }`}
          title={isCompared ? 'In Comparison (তুলনা থেকে সরান)' : 'Compare Product (পণ্য তুলনা করুন)'}
          aria-label="Toggle compare"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.4]" />
        </button>
      )}
    </div>
  );
}

/** Bottom Add-to-Cart button with brief “Added!” flash state. */
export function ProductCardAddButton({
  product,
  isOutOfStock,
  onAddToCart,
}: Pick<Shared, 'product' | 'isOutOfStock' | 'onAddToCart'>) {
  const [addedRecently, setAddedRecently] = useState(false);

  const handleAdd = (e: MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product, 1);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 1500);
  };

  return (
    <div className="mt-3 pt-2">
      <button
        type="button"
        onClick={handleAdd}
        disabled={isOutOfStock}
        className={`w-full py-1.5 sm:py-2 px-2 rounded-lg border font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 shadow-2xs ${
          isOutOfStock
            ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
            : addedRecently
              ? 'bg-emerald-600 border-emerald-600 text-white cursor-pointer active:scale-[0.98]'
              : 'border-[#f38018] text-[#f38018] hover:bg-[#f38018] hover:text-white bg-white cursor-pointer active:scale-[0.98]'
        }`}
      >
        {isOutOfStock ? (
          <span>স্টক আউট (Stock Out)</span>
        ) : addedRecently ? (
          <>
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Added!</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Add To Cart</span>
          </>
        )}
      </button>
    </div>
  );
}
