'use client';

import React from 'react';
import { SafeImage } from '@/components/shared/SafeImage';
import { ProductCardAddButton, ProductCardIconActions } from '@/components/product/ProductCardActions';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  currency?: 'USD' | 'BDT';
  searchQuery?: string;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number, color?: string, size?: string, customPrice?: number) => void;
  onBuyNow?: (product: Product, quantity?: number, color?: string, size?: string, customPrice?: number) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  searchQuery = '',
  isWishlisted = false,
  onToggleWishlist,
  isCompared = false,
  onToggleCompare,
  onAddToCart,
  onQuickView,
}) => {
  const isOutOfStock = !product.inStock || (product.stockCount !== undefined && product.stockCount <= 0);
  const currentPrice = Number(product.price || 0);
  const origPrice = Number(product.originalPrice || 0);
  const discountAmount = origPrice > currentPrice ? origPrice - currentPrice : 0;

  return (
    <div
      className="group relative bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
      onClick={() => onQuickView(product)}
      id={`product-card-${product.id}`}
    >
      <div>
        <div className="relative w-full aspect-square bg-stone-50/50 rounded-lg sm:rounded-xl flex items-center justify-center p-1 sm:p-2 overflow-hidden transition-all duration-300">
          <SafeImage
            src={product.image || (product.images && product.images[0])}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs pointer-events-none select-none"
            loading="lazy"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            referrerPolicy="no-referrer"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <div className="img-shield cursor-pointer" onContextMenu={(e) => e.preventDefault()} aria-hidden="true" />
          <div className="absolute inset-0 bg-stone-900/[0.02] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-lg sm:rounded-xl" />

          {isOutOfStock && (
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[0.5px] rounded-lg sm:rounded-xl flex items-center justify-center pointer-events-none z-15">
              <span className="px-2.5 py-1 bg-rose-600 text-white font-extrabold text-[11px] sm:text-xs rounded-md shadow-md uppercase tracking-wider">
                স্টক আউট (Out of Stock)
              </span>
            </div>
          )}

          {isOutOfStock ? (
            <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 z-20">
              <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-md shadow-xs bg-rose-600 text-white">স্টক আউট</span>
            </div>
          ) : product.badge ? (
            <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 z-10">
              <span
                className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-md shadow-2xs ${
                  product.badge === 'SALE'
                    ? 'bg-rose-600 text-white'
                    : product.badge === 'HOT'
                      ? 'bg-rose-500 text-white font-extrabold'
                      : product.badge === 'NEW'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#ef4444] text-white'
                }`}
              >
                {product.badge}
              </span>
            </div>
          ) : null}

          <ProductCardIconActions
            product={product}
            isWishlisted={isWishlisted}
            isCompared={isCompared}
            onToggleWishlist={onToggleWishlist}
            onToggleCompare={onToggleCompare}
          />
        </div>

        <div className="mt-2 sm:mt-2.5 text-left">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-stone-400 uppercase tracking-wider line-clamp-1 mb-0.5">
            <span>{product.category}</span>
            {product.subcategory && (
              <>
                <span className="text-stone-300">•</span>
                <span className="text-emerald-700 font-bold lowercase first-letter:uppercase">{product.subcategory}</span>
              </>
            )}
          </div>

          <h3 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-2 leading-snug group-hover:text-[#f38018] transition-colors min-h-[2rem] sm:min-h-[2.4rem]">
            {(() => {
              const query = (searchQuery || '').trim();
              if (!query || !product.name) return product.name;
              const escapedTerms = query
                .split(/\s+/)
                .filter(Boolean)
                .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
              if (escapedTerms.length === 0) return product.name;
              const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
              const parts = product.name.split(regex);
              return parts.map((part, index) =>
                regex.test(part) ? (
                  <mark key={index} className="bg-amber-200/90 text-stone-900 font-extrabold px-1 py-0.5 rounded-xs shadow-2xs group-hover:text-stone-900">
                    {part}
                  </mark>
                ) : (
                  <React.Fragment key={index}>{part}</React.Fragment>
                ),
              );
            })()}
          </h3>

          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 font-bengali flex-wrap">
            <span className="text-sm sm:text-base md:text-lg font-bold text-[#f38018] tracking-tight select-none">৳{currentPrice.toLocaleString()}</span>
            {origPrice > currentPrice && <span className="text-xs sm:text-sm text-stone-400 line-through select-none">৳{origPrice.toLocaleString()}</span>}
          </div>

          {discountAmount > 0 && (
            <div className="mt-1">
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold text-[#15803d] bg-[#dcfce7] font-bengali">
                Save ৳{discountAmount.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      <ProductCardAddButton product={product} isOutOfStock={isOutOfStock} onAddToCart={onAddToCart} />
    </div>
  );
};
