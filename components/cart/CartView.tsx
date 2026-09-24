'use client';

import React, { useState } from 'react';
import { SafeImage } from '@/components/shared/SafeImage';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Tag, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw 
} from 'lucide-react';
import { validateCoupon } from '@/lib/api/coupons';
import { CartItem, DeliveryConfig, DEFAULT_DELIVERY_CONFIG, CouponItem } from '@/types';
import { TakaIcon } from '@/components/shared/TakaIcon';
import { notify } from '@/lib/ui/notify';

interface CartViewProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedCheckout: (discountPercent: number, appliedCode: string) => void;
  currency: 'USD' | 'BDT';
  deliveryConfig?: DeliveryConfig;
  enableCoupons?: boolean;
  activeCoupons?: CouponItem[];
}

export const CartView: React.FC<CartViewProps> = ({
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  currency,
  deliveryConfig = DEFAULT_DELIVERY_CONFIG,
  enableCoupons = false,
  activeCoupons = [],
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState<number>(0);
  const [promoError, setPromoError] = useState('');

  const rate = 1;
  const symbol = '৳';

  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.customPrice || item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const discountPercent = enableCoupons ? appliedDiscountPercent : 0;
  const discountAmount = subtotal * discountPercent;
  
  const freeShippingThreshold = deliveryConfig.freeDeliveryThreshold || 2000;
  const isFreeShipping = deliveryConfig.enableFreeDelivery && subtotal >= freeShippingThreshold;
  const baseShippingRate = deliveryConfig.insideDhakaCharge ?? 80;
  const shipping = isFreeShipping || subtotal === 0 ? 0 : baseShippingRate;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enableCoupons) return;
    const code = promoInput.trim();
    if (!code) {
      const msg = 'কুপন কোড লিখুন।';
      setPromoError(msg);
      notify(msg, 'error');
      return;
    }
    try {
      const matched = await validateCoupon(code, subtotal, activeCoupons);
      setAppliedPromo(matched.code);
      setAppliedDiscountPercent(matched.discountPercent / 100);
      setPromoError('');
      notify(`কুপন ${matched.code} প্রয়োগ হয়েছে। ${matched.discountPercent}% ছাড় পাবেন।`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      const text = msg.startsWith('MIN_SPEND:')
        ? `এই কুপনে ন্যূনতম ৳${Number(msg.slice('MIN_SPEND:'.length)).toLocaleString()} টাকার অর্ডার লাগবে।`
        : 'কুপন কোড ভুল, অথবা মেয়াদ শেষ।';
      setPromoError(text);
      notify(text, 'error');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setAppliedDiscountPercent(0);
    setPromoInput('');
    setPromoError('');
    notify('কুপন সরানো হয়েছে।');
  };

  // If cart is empty, render the exact full-page layout from user screenshot
  if (items.length === 0) {
    return (
      <div className="w-full min-h-[calc(100vh-140px)] bg-white flex flex-col items-center justify-center px-4 py-16 sm:py-20">
        <div className="max-w-md w-full text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
          
          {/* Circular Shopping Bag Graphic matching the exact screenshot */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-stone-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] flex items-center justify-center text-[#FF5722] mb-5">
            <ShoppingBag className="w-7 h-7 sm:w-9 sm:h-9 stroke-[1.8] text-[#FF5722]" />
          </div>

          {/* Heading */}
          <h1 
            className="text-xl sm:text-2xl font-bold text-stone-900 mb-2.5 tracking-tight font-serif"
            style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
          >
            Your Cart is Empty
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-[13px] text-stone-500 max-w-sm sm:max-w-md mx-auto leading-relaxed mb-6">
            Explore our premium collections and add premium alcohol-free attars or organic foods to your cart.
          </p>

          {/* Start Shopping CTA Button */}
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-orange-500/20 active:scale-98 cursor-pointer"
            id="start-shopping-btn"
          >
            START SHOPPING
          </button>
        </div>
      </div>
    );
  }

  // Full Screen Cart View when items are present
  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-stone-50/50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Navigation Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              id="back-to-shop-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
            <div className="h-4 w-px bg-stone-300" />
            <h1 
              className="text-xl sm:text-2xl font-bold text-stone-900 font-serif"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
            >
              Shopping Cart <span className="text-sm font-normal text-stone-500">({totalCount} {totalCount === 1 ? 'item' : 'items'})</span>
            </h1>
          </div>

          {/* Quick Free Shipping Status */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-4 py-2 flex items-center gap-2 self-start sm:self-auto text-xs text-emerald-900">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            {isFreeShipping ? (
              <span className="font-bold">You qualify for FREE doorstep shipping!</span>
            ) : (
              <span>Add <strong>{symbol}{((freeShippingThreshold - subtotal) * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> more for FREE shipping</span>
            )}
          </div>
        </div>

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Product List Table / Cards (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Free Shipping Progress bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
              <div className="flex justify-between text-xs font-semibold text-stone-700 mb-2">
                <span>Free Delivery Progress</span>
                <span className="text-emerald-700 font-bold">
                  {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
                </span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs divide-y divide-stone-100 overflow-hidden">
              {items.map((item, idx) => (
                <div 
                  key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}-${idx}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors"
                >
                  {/* Image and Title */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <SafeImage
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-50 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        {item.product.category}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-stone-900 mt-1 truncate">
                        {item.product.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-stone-500 mt-0.5">
                        {item.selectedColor && <span>Color: <strong>{item.selectedColor}</strong></span>}
                        {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                      </div>
                      <p className="text-xs text-stone-400 mt-1 font-bengali">
                        Unit Price: <span className="text-[#f38018] font-semibold">৳{(item.customPrice || item.product.price).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    {/* Quantity Stepper */}
                    <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 p-1">
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white text-stone-700 hover:bg-stone-200 text-sm font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white text-stone-700 hover:bg-stone-200 text-sm font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="text-right min-w-[90px] font-bengali">
                      <span className="font-extrabold text-sm sm:text-base text-[#f38018]">
                        ৳{((item.customPrice || item.product.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove from Cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom shopping assurance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">100% Halal Certified</h4>
                  <p className="text-[11px] text-stone-500">Pure, alcohol-free & authentic</p>
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex items-center gap-3">
                <Truck className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Cash on Delivery</h4>
                  <p className="text-[11px] text-stone-500">All 64 districts in BD</p>
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">7 Days Easy Return</h4>
                  <p className="text-[11px] text-stone-500">Guaranteed replacement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary Card (4 Cols) */}
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-6">
              <h2 
                className="text-lg font-bold text-stone-900 font-serif border-b border-stone-100 pb-3"
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              >
                Order Summary
              </h2>

              {/* Coupon Code Section (Only rendered when enableCoupons is TRUE) */}
              {enableCoupons && (
                <div>
                  {!appliedPromo ? (
                    <form onSubmit={handleApplyPromo} className="space-y-2">
                      <label className="text-xs font-bold text-stone-700">Promo / Coupon Code</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="e.g. DISCOUNT10"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            className="w-full text-xs py-2.5 pl-9 pr-3 bg-stone-50 border border-stone-200 rounded-xl uppercase placeholder:normal-case focus:outline-none focus:border-stone-900"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[11px] text-rose-500 pl-1">{promoError}</p>
                      )}
                    </form>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>{appliedPromo} ({Math.round(discountPercent * 100)}% OFF)</span>
                      </div>
                      <button
                        onClick={removePromo}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs text-stone-600 pt-2 border-t border-stone-100 font-bengali">
                <div className="flex justify-between">
                  <span className="font-sans">Subtotal ({totalCount} items)</span>
                  <span className="font-bold text-stone-900">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span className="font-sans">Coupon Discount</span>
                    <span>
                      -৳{discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="font-sans">Doorstep Delivery</span>
                  <span className="font-bold text-stone-900">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase font-sans">FREE</span>
                    ) : (
                      `৳${shipping}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-stone-900 pt-3 border-t border-stone-200">
                  <span className="font-sans">Grand Total</span>
                  <span className="text-[#f38018] text-lg font-black tracking-tight select-none">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => onProceedCheckout(discountPercent, appliedPromo || '')}
                className="w-full py-4 px-6 rounded-xl bg-[#0A3828] hover:bg-[#072418] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/20 active:scale-98 cursor-pointer"
                id="cart-proceed-checkout-btn"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
