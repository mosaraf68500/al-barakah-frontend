'use client';

import React, { useState } from 'react';
import { SafeImage } from '@/components/shared/SafeImage';
import { 
  X, 
  Trash2, 
  ShoppingCart, 
  Zap, 
  Star, 
  Check, 
  Plus, 
  ArrowLeftRight, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Package,
  Layers,
  Search
} from 'lucide-react';
import { Product } from '@/types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareProducts?: Product[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onAddProduct?: (product: Product) => void;
  allProducts?: Product[];
  onAddToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string, customPrice?: number) => void;
  onBuyNow: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string, customPrice?: number) => void;
  onSelectProduct?: (product: Product) => void;
  onOpenProductModal?: (product: Product) => void;
  currency?: 'USD' | 'BDT';
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  compareProducts = [],
  onRemoveProduct,
  onClearAll,
  onAddProduct,
  allProducts = [],
  onAddToCart,
  onBuyNow,
  onSelectProduct,
  onOpenProductModal,
  currency = 'BDT',
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter out any invalid items safely
  const safeCompareProducts = Array.isArray(compareProducts)
    ? compareProducts.filter((p): p is Product => Boolean(p && typeof p === 'object' && p.id))
    : [];
  const safeAllProducts = Array.isArray(allProducts)
    ? allProducts.filter((p): p is Product => Boolean(p && typeof p === 'object' && p.id))
    : [];

  const handleSelectProd = (prod: Product) => {
    if (!prod) return;
    if (onSelectProduct) {
      onSelectProduct(prod);
    } else if (onOpenProductModal) {
      onOpenProductModal(prod);
    }
  };

  const availableToAdd = safeAllProducts.filter((p) => {
    if (!p || !p.id) return false;
    const alreadyInCompare = safeCompareProducts.some((cp) => cp && cp.id === p.id);
    if (alreadyInCompare) return false;
    const searchStr = pickerSearch.trim().toLowerCase();
    if (!searchStr) return true;
    const nameStr = typeof p.name === 'string' ? p.name.toLowerCase() : '';
    const catStr = typeof p.category === 'string' ? p.category.toLowerCase() : '';
    return nameStr.includes(searchStr) || catStr.includes(searchStr);
  });

  const handleAddToCartClick = (product: Product) => {
    if (!product) return;
    onAddToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const handleBuyNowClick = (product: Product) => {
    if (!product) return;
    onBuyNow(product, 1);
    onClose();
  };

  // Up to 3 comparison slots
  const slots = [0, 1, 2];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      id="product-compare-modal"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-stone-50 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-100 text-[#f38018] flex items-center justify-center font-bold shrink-0">
              <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 font-bengali">
                  পণ্য তুলনা (Compare Products)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-[#f38018]">
                  {safeCompareProducts.length}/3 পণ্য
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 font-bengali">
                দাম, রেটিং, স্পেসিফিকেশন ও গুণাগুণ পাশাপাশি যাচাই করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {safeCompareProducts.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-stone-200"
                id="clear-all-compare-btn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>সব মুছুন (Clear All)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
              aria-label="Close Comparison Modal"
              id="close-compare-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-6 custom-scrollbar">
          {safeCompareProducts.length === 0 ? (
            <div className="py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-orange-50 flex items-center justify-center text-[#f38018] mb-4">
                <ArrowLeftRight className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.8]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-800 font-bengali">
                তুলনা করার জন্য কোনো পণ্য নির্বাচন করা হয়নি
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto font-bengali">
                যেকোনো প্রোডাক্ট কার্ড থেকে &ldquo;Compare&rdquo; বাটনে ক্লিক করে সর্বোচ্চ ৩টি পণ্য পাশাপাশি রেখে তুলনা করুন।
              </p>
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f38018] hover:bg-[#e0700c] text-white font-bold text-sm shadow-sm transition-all cursor-pointer font-bengali"
                id="add-first-product-compare-btn"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>পণ্য যোগ করুন (Add Product)</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 min-w-[300px]">
              {slots.map((idx) => {
                const product = safeCompareProducts[idx];

                if (product) {
                  const currentPrice = Number(product.price || 0);
                  const origPrice = Number(product.originalPrice || 0);
                  const discountAmount = origPrice > currentPrice ? origPrice - currentPrice : 0;
                  const isAdded = addedProductId === product.id;

                  // Defensive rating calculation
                  const rawRating = typeof product.rating === 'number' ? product.rating : Number(product.rating);
                  const formattedRating = !isNaN(rawRating) && rawRating > 0 ? rawRating.toFixed(1) : '5.0';
                  const reviewCount = typeof product.reviewCount === 'number' ? product.reviewCount : Number(product.reviewCount) || 12;

                  // Defensive features list
                  const featuresList: string[] = Array.isArray(product.features)
                    ? product.features.filter((f) => typeof f === 'string' && f.trim().length > 0)
                    : typeof product.features === 'string' && (product.features as string).trim()
                    ? (product.features as string).split(',').map((s) => s.trim()).filter(Boolean)
                    : [];

                  // Defensive sizes / weight
                  const sizesList: string[] = Array.isArray(product.sizes)
                    ? product.sizes.filter((s) => typeof s === 'string' && s.trim().length > 0)
                    : typeof product.sizes === 'string' && (product.sizes as string).trim()
                    ? (product.sizes as string).split(',').map((s) => s.trim()).filter(Boolean)
                    : [];
                  const displayWeight = product.weight || sizesList[0] || 'স্ট্যান্ডার্ড প্যাক';

                  // Safe Image Fallback
                  const imgSrc = product.image || (Array.isArray(product.images) && product.images[0]) || 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&q=80&w=400';
                  const inStock = product.inStock !== false;

                  return (
                    <div
                      key={product.id || `compare-slot-${idx}`}
                      className="bg-white rounded-xl border border-stone-200 shadow-xs hover:shadow-md transition-all p-3 sm:p-4 flex flex-col justify-between relative group"
                      id={`compare-slot-${idx}-${product.id}`}
                    >
                      {/* Top Bar: Slot label & Remove */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                          পণ্য #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveProduct(product.id)}
                          className="text-stone-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove from comparison"
                          aria-label="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Product Image & Badge */}
                      <div 
                        className="relative w-full h-36 sm:h-44 bg-stone-50 rounded-lg flex items-center justify-center p-2 mb-3 cursor-pointer overflow-hidden group/img"
                        onClick={() => {
                          handleSelectProd(product);
                          onClose();
                        }}
                      >
                        <SafeImage
                          src={imgSrc}
                          alt={product.name || 'Product'}
                          className="w-full h-full object-contain mix-blend-multiply group-hover/img:scale-105 transition-transform duration-300"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        {product.badge && (
                          <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md shadow-2xs ${
                            product.badge === 'SALE' ? 'bg-rose-600 text-white' : 'bg-[#f38018] text-white'
                          }`}>
                            {product.badge}
                          </span>
                        )}
                        <span className="absolute bottom-1 right-1 bg-white/80 backdrop-blur-xs text-[10px] text-stone-600 px-1.5 py-0.5 rounded flex items-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <ExternalLink className="w-2.5 h-2.5" /> Details
                        </span>
                      </div>

                      {/* Info & Specs */}
                      <div className="flex-1 flex flex-col gap-2.5 text-left">
                        {/* Title & Category */}
                        <div>
                          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                            {product.category || 'General'}
                          </div>
                          <h4 
                            className="text-sm font-bold text-stone-900 line-clamp-2 hover:text-[#f38018] transition-colors cursor-pointer leading-snug mt-0.5"
                            onClick={() => {
                              handleSelectProd(product);
                              onClose();
                            }}
                          >
                            {product.name || 'নামবিহীন পণ্য'}
                          </h4>
                        </div>

                        {/* Pricing */}
                        <div className="bg-orange-50/60 p-2 sm:p-2.5 rounded-lg border border-orange-100/80">
                          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-0.5">
                            মূল্য (Price)
                          </div>
                          <div className="flex items-baseline gap-1.5 font-bengali flex-wrap">
                            <span className="text-base sm:text-lg font-extrabold text-[#f38018]">
                              ৳{currentPrice.toLocaleString()}
                            </span>
                            {origPrice > currentPrice && (
                              <span className="text-xs text-stone-400 line-through">
                                ৳{origPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {discountAmount > 0 && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bengali">
                              সাশ্রয় ৳{discountAmount.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Specs Grid */}
                        <div className="space-y-1.5 text-xs text-stone-700 border-t border-stone-100 pt-2 font-bengali">
                          {/* Rating */}
                          <div className="flex items-center justify-between py-1 border-b border-stone-50">
                            <span className="text-stone-500 text-[11px]">রেটিং:</span>
                            <div className="flex items-center gap-1 font-semibold text-stone-800">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{formattedRating}</span>
                              <span className="text-stone-400 text-[10px]">
                                ({reviewCount} রিভিউ)
                              </span>
                            </div>
                          </div>

                          {/* Stock Status */}
                          <div className="flex items-center justify-between py-1 border-b border-stone-50">
                            <span className="text-stone-500 text-[11px]">স্টক স্ট্যাটাস:</span>
                            <span className={`font-bold text-[11px] px-2 py-0.5 rounded-full ${
                              inStock 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {inStock ? 'In Stock (মজুদ আছে)' : 'Stock Out (মজুদ নেই)'}
                            </span>
                          </div>

                          {/* Weight / Pack Size */}
                          <div className="flex items-center justify-between py-1 border-b border-stone-50">
                            <span className="text-stone-500 text-[11px]">পরিমাণ/ওজন:</span>
                            <span className="font-semibold text-stone-800 text-[11px]">
                              {displayWeight}
                            </span>
                          </div>

                          {/* Origin / Brand */}
                          {(product.origin || product.brand) && (
                            <div className="flex items-center justify-between py-1 border-b border-stone-50">
                              <span className="text-stone-500 text-[11px]">উৎস/ব্র্যান্ড:</span>
                              <span className="font-semibold text-stone-800 text-[11px]">
                                {product.origin || product.brand || 'Al-Barakah'}
                              </span>
                            </div>
                          )}

                          {/* Key Features */}
                          {featuresList.length > 0 && (
                            <div className="pt-1.5">
                              <span className="text-stone-500 text-[11px] block mb-1">মূল বৈশিষ্ট্য:</span>
                              <ul className="space-y-1">
                                {featuresList.slice(0, 3).map((feat, fIdx) => (
                                  <li key={fIdx} className="flex items-start gap-1.5 text-[11px] text-stone-600 leading-tight">
                                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddToCartClick(product)}
                          disabled={!inStock}
                          className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : !inStock
                              ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                              : 'border-[#f38018] text-[#f38018] hover:bg-[#f38018] hover:text-white bg-white'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Added to Cart!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5 stroke-[2.2]" />
                              <span>কার্টে যোগ করুন</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBuyNowClick(product)}
                          disabled={!inStock}
                          className="w-full py-2 px-3 rounded-xl bg-[#f38018] hover:bg-[#e0700c] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>সরাসরি অর্ডার করুন</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // Empty Slot
                return (
                  <div
                    key={`empty-slot-${idx}`}
                    className="border-2 border-dashed border-stone-200 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center text-center bg-stone-50/50 min-h-[360px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
                      <Plus className="w-6 h-6 stroke-[2]" />
                    </div>
                    <h4 className="text-sm font-bold text-stone-700 font-bengali">
                      স্লট #{idx + 1} খালি
                    </h4>
                    <p className="text-xs text-stone-400 mt-1 max-w-[200px] font-bengali">
                      তুলনা করার জন্য আরেকটি পণ্য নির্বাচন করুন
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(true)}
                      className="mt-4 px-4 py-2 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 font-bengali"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>পণ্য পছন্দ করুন</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 font-bengali">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>১০০% খাঁটি ও হালাল প্রিমিয়াম কোয়ালিটি নিশ্চিত</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium transition-colors cursor-pointer"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>

      {/* Quick Product Picker Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-200 bg-stone-50">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 font-bengali flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#f38018]" />
                তুলনার জন্য পণ্য বাছাই করুন
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsPickerOpen(false);
                  setPickerSearch('');
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-stone-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="পণ্য খুঁজুন (Search product)..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all font-bengali"
                  autoFocus
                />
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[400px] custom-scrollbar">
              {availableToAdd.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-500 font-bengali">
                  কোনো পণ্য পাওয়া যায়নি বা সবগুলো ইতোমধ্যে যোগ করা হয়েছে।
                </div>
              ) : (
                availableToAdd.map((prod) => {
                  const prodImg = prod.image || (Array.isArray(prod.images) && prod.images[0]) || 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&q=80&w=400';
                  return (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-stone-100 hover:border-orange-200 hover:bg-orange-50/40 transition-all cursor-pointer group"
                      onClick={() => {
                        if (onAddProduct) {
                          onAddProduct(prod);
                        }
                        setIsPickerOpen(false);
                        setPickerSearch('');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-stone-50 border border-stone-100 p-1 flex items-center justify-center shrink-0">
                          <SafeImage
                            src={prodImg}
                            alt={prod.name || 'Product'}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-bold text-stone-400 uppercase">
                            {prod.category || 'General'}
                          </span>
                          <h5 className="text-xs sm:text-sm font-bold text-stone-800 line-clamp-1 group-hover:text-[#f38018] transition-colors">
                            {prod.name || 'Unnamed Product'}
                          </h5>
                          <div className="text-xs font-bold text-[#f38018] font-bengali">
                            ৳{Number(prod.price || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-[#f38018] hover:bg-[#e0700c] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 font-bengali"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>যোগ করুন</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

