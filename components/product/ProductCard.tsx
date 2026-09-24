'use client';

import React, { useState } from 'react';
import { SafeImage } from '@/components/shared/SafeImage';
import { ShoppingCart, Check, Heart, ArrowLeftRight } from 'lucide-react';
import { Product } from '@/types';

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
  currency = 'BDT',
  searchQuery = '',
  isWishlisted = false,
  onToggleWishlist,
  isCompared = false,
  onToggleCompare,
  onAddToCart,
  onQuickView,
}) => {
  const [addedRecently, setAddedRecently] = useState(false);

  const isOutOfStock = !product.inStock || (product.stockCount !== undefined && product.stockCount <= 0);
  const currentPrice = Number(product.price || 0);
  const origPrice = Number(product.originalPrice || 0);
  const discountAmount = origPrice > currentPrice ? origPrice - currentPrice : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product, 1);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCompare) {
      onToggleCompare(product);
    }
  };

  return (
    <div 
      className="group relative bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
      onClick={() => onQuickView(product)}
      id={`product-card-${product.id}`}
    >
      <div>
        {/* Product Image Container with subtle hover effect & anti-theft shield */}
        <div className="relative w-full aspect-square bg-stone-50/50 rounded-lg sm:rounded-xl flex items-center justify-center p-1 sm:p-2 overflow-hidden transition-all duration-300">
          <SafeImage
            src={product.image || (product.images && product.images[0])}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs pointer-events-none select-none"
            loading="lazy"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            referrerPolicy="no-referrer"
          />

          {/* Level 1: Transparent Overlay Layer to block long-press and right-click on mobile/desktop */}
          <div 
            className="img-shield cursor-pointer" 
            onContextMenu={(e) => e.preventDefault()} 
            aria-hidden="true"
          />

          {/* Subtle hover overlay */}
          <div className="absolute inset-0 bg-stone-900/[0.02] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-lg sm:rounded-xl" />

          {/* Out of Stock Overlay on Image */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[0.5px] rounded-lg sm:rounded-xl flex items-center justify-center pointer-events-none z-15">
              <span className="px-2.5 py-1 bg-rose-600 text-white font-extrabold text-[11px] sm:text-xs rounded-md shadow-md uppercase tracking-wider">
                স্টক আউট (Out of Stock)
              </span>
            </div>
          )}

          {/* Badge */}
          {isOutOfStock ? (
            <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 z-20">
              <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-md shadow-xs bg-rose-600 text-white">
                স্টক আউট
              </span>
            </div>
          ) : product.badge ? (
            <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 z-10">
              <span className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-md shadow-2xs ${
                product.badge === 'SALE' 
                  ? 'bg-rose-600 text-white' 
                  : product.badge === 'HOT' 
                  ? 'bg-rose-500 text-white font-extrabold' 
                  : product.badge === 'NEW'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#ef4444] text-white'
              }`}>
                {product.badge}
              </span>
            </div>
          ) : null}

          {/* Top Right Action Buttons: Wishlist & Compare */}
          <div className="absolute top-1.5 right-1.5 z-10 flex flex-col gap-1.5">
            {onToggleWishlist && (
              <button
                onClick={handleWishlist}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-rose-500'
                }`}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-label="Toggle wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            )}

            {onToggleCompare && (
              <button
                onClick={handleCompare}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isCompared
                    ? 'bg-[#f38018] text-white shadow-xs'
                    : 'bg-stone-100/90 hover:bg-stone-200 text-stone-600 hover:text-[#f38018]'
                }`}
                title={isCompared ? 'In Comparison (তুলনা থেকে সরান)' : 'Compare Product (পণ্য তুলনা করুন)'}
                aria-label="Toggle compare"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.4]" />
              </button>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-2 sm:mt-2.5 text-left">
          {/* Category & Subcategory */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-stone-400 uppercase tracking-wider line-clamp-1 mb-0.5">
            <span>{product.category}</span>
            {product.subcategory && (
              <>
                <span className="text-stone-300">•</span>
                <span className="text-emerald-700 font-bold lowercase first-letter:uppercase">{product.subcategory}</span>
              </>
            )}
          </div>

          {/* Product Title with Search Highlight */}
          <h3 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-2 leading-snug group-hover:text-[#f38018] transition-colors min-h-[2rem] sm:min-h-[2.4rem]">
            {(() => {
              const query = (searchQuery || '').trim();
              if (!query || !product.name) {
                return product.name;
              }

              // Split search query by space to match multiple words or full phrase
              const escapedTerms = query
                .split(/\s+/)
                .filter(Boolean)
                .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

              if (escapedTerms.length === 0) return product.name;

              const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
              const parts = product.name.split(regex);

              return parts.map((part, index) =>
                regex.test(part) ? (
                  <mark
                    key={index}
                    className="bg-amber-200/90 text-stone-900 font-extrabold px-1 py-0.5 rounded-xs shadow-2xs group-hover:text-stone-900"
                  >
                    {part}
                  </mark>
                ) : (
                  <React.Fragment key={index}>{part}</React.Fragment>
                )
              );
            })()}
          </h3>

          {/* Pricing & Strikeout */}
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 font-bengali flex-wrap">
            <span className="text-sm sm:text-base md:text-lg font-bold text-[#f38018] tracking-tight select-none">
              ৳{currentPrice.toLocaleString()}
            </span>
            {origPrice > currentPrice && (
              <span className="text-xs sm:text-sm text-stone-400 line-through select-none">
                ৳{origPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Dynamic Auto-Discount Save Badge (Shows ONLY when discountAmount > 0) */}
          {discountAmount > 0 && (
            <div className="mt-1">
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold text-[#15803d] bg-[#dcfce7] font-bengali">
                Save ৳{discountAmount.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button: Add To Cart (Outline orange button matching Ghorer Bazar) */}
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
    </div>
  );
};

