'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { CartItem } from '@/types';
import { TakaIcon } from '@/components/shared/TakaIcon';

interface FloatingCartWidgetProps {
  cart: CartItem[];
  currency: 'USD' | 'BDT';
  onOpenCart: () => void;
}

export const FloatingCartWidget: React.FC<FloatingCartWidgetProps> = ({
  cart,
  currency,
  onOpenCart,
}) => {
  const totalPrice = cart.reduce((sum, item) => sum + (item.customPrice || item.product.price) * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside
      aria-label="Shopping Cart Quick Access"
      onClick={onOpenCart}
      id="floating-cart-sidebar-btn"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-stretch overflow-hidden rounded-l-xl shadow-[0_4px_20px_rgb(0,0,0,0.14)] cursor-pointer select-none transition-all duration-300 hover:-translate-x-0.5 border-t border-b border-l border-stone-200/90 bg-white group w-[54px] sm:w-[62px]"
      title="View Cart"
    >
      {/* Top Orange Header: Shopping Bag Icon + Item Count (Compact) */}
      <div className="bg-[#f38018] group-hover:bg-[#e0700c] text-white pt-2 pb-1.5 px-1 flex flex-col items-center justify-center transition-colors">
        <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2] text-white" />
        <span className="text-[9.5px] sm:text-[10.5px] font-semibold text-white mt-0.5 leading-tight tracking-tight whitespace-nowrap">
          {totalCount} {totalCount === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Bottom White Area: Price with Currency (৳) */}
      <div className="bg-white py-1.5 px-1 flex items-center justify-center border-t border-orange-100/80">
        <span className="text-[11px] sm:text-[12px] font-bold text-[#f38018] leading-none tracking-tight font-bengali select-none">
          ৳{totalPrice.toLocaleString()}
        </span>
      </div>
    </aside>
  );
};
