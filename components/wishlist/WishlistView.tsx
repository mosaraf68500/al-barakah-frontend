'use client';

import React from 'react';
import { SafeImage } from '@/components/shared/SafeImage';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  ArrowLeft, 
  Info, 
  LogIn, 
  Sparkles, 
  ShieldCheck, 
  Check 
} from 'lucide-react';
import { Product } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { TakaIcon } from '@/components/shared/TakaIcon';

interface WishlistViewProps {
  wishlist: Product[];
  onClose: () => void;
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onDirectBuy: (product: Product) => void;
  currency: 'USD' | 'BDT';
  onOpenAuth: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  onClose,
  onRemoveFromWishlist,
  onAddToCart,
  onQuickView,
  onDirectBuy,
  currency,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const rate = 1;
  const symbol = '৳';

  // Empty state matching the screenshot style
  if (wishlist.length === 0) {
    return (
      <div className="w-full min-h-[calc(100vh-140px)] bg-white flex flex-col items-center justify-center px-4 py-16 sm:py-20">
        <div className="max-w-md w-full text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
          
          {/* Circular Heart Graphic */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-stone-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] flex items-center justify-center text-rose-500 mb-5">
            <Heart className="w-7 h-7 sm:w-9 sm:h-9 stroke-[1.8] text-rose-500" />
          </div>

          {/* Heading */}
          <h1 
            className="text-xl sm:text-2xl font-bold text-stone-900 mb-2.5 tracking-tight font-serif"
            style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
          >
            Your Wishlist is Empty
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-[13px] text-stone-500 max-w-sm sm:max-w-md mx-auto leading-relaxed mb-6">
            Explore our premium collections and save your favorite alcohol-free attars, sunglasses, or organic foods.
          </p>

          {/* Start Shopping CTA Button */}
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-orange-500/20 active:scale-98 cursor-pointer"
            id="wishlist-start-shopping-btn"
          >
            START SHOPPING
          </button>
        </div>
      </div>
    );
  }

  // Full Screen View when items are present
  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#FAF8F5]/60 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Navigation Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
            <div className="h-4 w-px bg-stone-300" />
            <h1 
              className="text-xl sm:text-2xl font-bold text-stone-900 font-serif"
              style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
            >
              My Saved Wishlist <span className="text-sm font-normal text-stone-500">({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})</span>
            </h1>
          </div>
        </div>

        {/* Guest Reminder Banner */}
        {!user && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">Keep Your Wishlist Synced</h4>
                <p className="text-[11px] text-amber-800/90">
                  You are browsing as a guest. Sign in to access your saved items from any device.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenAuth}
              className="shrink-0 px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>LOGIN NOW</span>
            </button>
          </div>
        )}

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Top Image area */}
              <div className="relative aspect-square overflow-hidden bg-stone-50">
                <SafeImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />

                {/* Category tag */}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] uppercase tracking-wider font-bold text-stone-800 px-2 py-0.5 rounded-md shadow-2xs">
                  {product.category}
                </span>

                {/* Remove button */}
                <button
                  onClick={() => onRemoveFromWishlist(product)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors shadow-2xs cursor-pointer"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 
                    onClick={() => onQuickView(product)}
                    className="font-bold text-sm text-stone-900 hover:text-[#FF5722] transition-colors cursor-pointer line-clamp-2"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-1">
                    {(product as any).subtitle || (product as any).volume || (product as any).size || 'Premium Authentic Item'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-semibold uppercase">Price</span>
                    <span className="font-extrabold text-[#f38018] text-base font-bengali select-none">
                      ৳{product.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Add to cart action */}
                  <button
                    onClick={() => onAddToCart(product)}
                    className="px-3.5 py-2 rounded-xl bg-[#0A3828] hover:bg-[#072418] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
