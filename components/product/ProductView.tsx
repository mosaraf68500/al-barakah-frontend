'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SafeImage } from '@/components/shared/SafeImage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShoppingBag, 
  Zap, 
  Heart, 
  Truck, 
  Plus, 
  Minus, 
  Check, 
  Layers,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Facebook,
  ArrowRight,
  Home,
  MessageSquare,
  Send,
  CheckCircle2,
  ThumbsUp,
  ArrowLeftRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Product, Category, CategoryItem, ProductReview } from '@/types';
import { parseVariantOptions, getCalculatedPrice } from '@/lib/catalog/pricing';
import { getSmartRelatedProducts } from '@/lib/catalog/relatedProducts';
import { Navbar } from '@/components/layout/Navbar';
import { TakaIcon } from '@/components/shared/TakaIcon';
import { notify } from '@/lib/ui/notify';

interface ProductViewProps {
  product: Product | null;
  onClose: () => void;
  currency: 'USD' | 'BDT';
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string, customPrice?: number) => void;
  onBuyNow: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string, customPrice?: number) => void;
  allProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
  onOpenPolicy?: () => void;
  cartCount?: number;
  wishlistCount?: number;
  compareCount?: number;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  onOpenCompare?: () => void;
  onOpenOrders?: () => void;
  onOpenCustomerDashboard?: () => void;
  onOpenAuth?: (tab?: 'LOGIN' | 'TRACK') => void;
  categories?: CategoryItem[];
  enableCustomerReviews?: boolean;
  reviews?: ProductReview[];
  onAddReview?: (review: Omit<ProductReview, 'id' | 'createdAt'>) => void | Promise<void>;
}

export const ProductView: React.FC<ProductViewProps> = ({
  product,
  onClose,
  currency,
  isWishlisted,
  onToggleWishlist,
  isCompared = false,
  onToggleCompare,
  onAddToCart,
  onBuyNow,
  allProducts = [],
  onSelectProduct,
  onOpenPolicy,
  cartCount = 0,
  wishlistCount = 0,
  compareCount = 0,
  onOpenCart,
  onOpenWishlist,
  onOpenCompare,
  onOpenOrders,
  onOpenCustomerDashboard,
  onOpenAuth,
  categories = [],
  enableCustomerReviews = true,
  reviews = [],
  onAddReview,
}) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Customer Review Form States
  const [reviewName, setReviewName] = useState('');
  const [reviewCity, setReviewCity] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  // Lock background body scroll completely when modal is open
  useEffect(() => {
    if (product) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
      };
    }
  }, [product]);

  // Reset state when product changes & scroll to top
  useEffect(() => {
    if (product) {
      setSelectedImgIndex(0);
      const pVariants = parseVariantOptions(product.sizes || []);
      const bVariant = pVariants.length > 0 ? pVariants[0].label : (product.weight || '');
      setSelectedVariant(bVariant);
      setQuantity(1);
      setAddedAnimation(false);
      
      if (pageContainerRef.current) {
        pageContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [product]);

  if (!product) return null;

  // Gallery Images - ensure 3 thumbnails
  const rawImages: string[] = (product.images && product.images.length > 0)
    ? product.images
    : [product.image];
  
  const galleryImages: string[] = rawImages.length >= 3 
    ? rawImages 
    : rawImages.length === 2 
    ? [...rawImages, rawImages[0]] 
    : [rawImages[0], rawImages[0], rawImages[0]];

  const currentActiveImage = galleryImages[selectedImgIndex] || product.image;

  // Variant & Dynamic Price calculation
  const parsedVariants = parseVariantOptions(product.sizes || []);
  const baseVariant = parsedVariants.length > 0 ? parsedVariants[0].label : (product.weight || '');
  const currentVariant = selectedVariant || baseVariant;

  const currentPrice = getCalculatedPrice(product.price, baseVariant, currentVariant);
  const currentOriginalPrice = product.originalPrice 
    ? getCalculatedPrice(product.originalPrice, baseVariant, currentVariant) 
    : undefined;

  const isOutOfStock = !product.inStock || (product.stockCount !== undefined && product.stockCount <= 0);

  const discountPercentage = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  // Calculate smart related products using relevance algorithm
  const displayRelated = getSmartRelatedProducts(product, allProducts || [], 4);

  const handleQuantityChange = (delta: number) => {
    if (isOutOfStock) return;
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCartClick = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity, undefined, currentVariant, currentPrice);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNowClick = () => {
    if (isOutOfStock) return;
    onBuyNow(product, quantity, undefined, currentVariant, currentPrice);
  };

  const handleNextImage = () => {
    setSlideDirection('right');
    setSelectedImgIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setSlideDirection('left');
    setSelectedImgIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleThumbnailClick = (idx: number) => {
    if (idx !== selectedImgIndex) {
      setSlideDirection(idx > selectedImgIndex ? 'right' : 'left');
      setSelectedImgIndex(idx);
    }
  };

  const handleRelatedProductClick = (item: Product) => {
    if (onSelectProduct) {
      onSelectProduct(item);
    }
    if (pageContainerRef.current) {
      pageContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reviews for this specific product
  const productReviews = reviews.filter((r) => r.productId === product.id && r.approved !== false);
  const totalReviewsCount = (product.reviewCount || 0) + productReviews.length;
  const averageRating = productReviews.length > 0
    ? (productReviews.reduce((acc, curr) => acc + curr.rating, 0) / productReviews.length).toFixed(1)
    : (product.rating || 5.0).toFixed(1);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim()) {
      notify('রিভিউতে আপনার নাম লিখুন।', 'error');
      return;
    }
    if (!reviewComment.trim()) {
      notify('রিভিউতে মতামত লিখুন।', 'error');
      return;
    }

    if (!onAddReview) return;
    setReviewSaving(true);
    try {
      await onAddReview({
        productId: product.id,
        productName: product.name,
        customerName: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
        city: reviewCity.trim() || 'Bangladesh',
        verifiedPurchase: true,
        approved: true,
      });
      setReviewSubmitted(true);
      setReviewComment('');
      setReviewName('');
      setReviewCity('');
      setTimeout(() => {
        setReviewSubmitted(false);
        setIsReviewFormOpen(false);
      }, 3000);
    } catch {
      /* addReview already showed the reason */
    } finally {
      setReviewSaving(false);
    }
  };

  return (
    <div 
      ref={pageContainerRef}
      className="fixed inset-0 z-50 w-full h-full min-h-screen bg-stone-100 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col"
      id="full-product-page-view"
    >
      
      {/* 1. OUR OFFICIAL WEBSITE HEADER BAR */}
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
        }}
        selectedCategory={product.category as Category || 'All'}
        onSelectCategory={() => {
          onClose();
        }}
        onOpenCart={() => {
          if (onOpenCart) onOpenCart();
        }}
        onOpenWishlist={() => {
          if (onOpenWishlist) onOpenWishlist();
        }}
        onOpenOrders={() => {
          if (onOpenOrders) onOpenOrders();
        }}
        onOpenCustomerDashboard={() => {
          if (onOpenCustomerDashboard) onOpenCustomerDashboard();
        }}
        onOpenAuth={(tab) => {
          if (onOpenAuth) onOpenAuth(tab);
        }}
        categories={categories}
        products={allProducts}
        onSelectProduct={(p) => {
          if (onSelectProduct) onSelectProduct(p);
        }}
      />

      {/* 2. MAIN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        
        {/* BREADCRUMB NAVIGATION (Placed cleanly under the official header) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 font-medium px-1 py-1">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex items-center gap-1 hover:text-[#0A3828] text-stone-600 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <button 
            type="button" 
            onClick={onClose} 
            className="hover:text-[#0A3828] text-stone-600 transition-colors cursor-pointer"
          >
            Products
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="text-[#0A3828] font-bold truncate max-w-[200px] sm:max-w-md">
            {product.category || product.name}
          </span>
        </nav>

        {/* PRODUCT MAIN CARD */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-7">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: GALLERY (3 Thumbnails + Big Center Image) */}
            <div className="md:col-span-6 flex gap-3 sm:gap-4 items-start">
              
              {/* 3 Left Vertical Thumbnails */}
              <div className="flex flex-col gap-2.5 shrink-0">
                {galleryImages.slice(0, 3).map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleThumbnailClick(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white p-1.5 flex items-center justify-center ${
                      selectedImgIndex === idx
                        ? 'border-[#f38018] shadow-xs ring-2 ring-[#f38018]/20 scale-102'
                        : 'border-stone-200 opacity-75 hover:opacity-100 hover:border-stone-300'
                    }`}
                  >
                    <SafeImage
                      src={imgUrl}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain pointer-events-none select-none"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      referrerPolicy="no-referrer"
                    />
                    {/* Level 1: Transparent Shield on thumbnail */}
                    <div 
                      className="img-shield cursor-pointer" 
                      onContextMenu={(e) => e.preventDefault()}
                      aria-hidden="true" 
                    />
                    {selectedImgIndex === idx && (
                      <div className="absolute inset-0 bg-[#f38018]/10 pointer-events-none z-10" />
                    )}
                  </button>
                ))}
              </div>

              {/* Center Main Product Image with Hero Banner Right-to-Left Sliding Animation */}
              <div className="relative flex-1 aspect-square max-h-[380px] sm:max-h-[460px] rounded-xl overflow-hidden bg-white border border-stone-100 flex items-center justify-center p-3">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={selectedImgIndex}
                    initial={{
                      opacity: 0,
                      x: slideDirection === 'right' ? 80 : -80,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      x: slideDirection === 'right' ? -80 : 80,
                      scale: 0.95,
                    }}
                    transition={{
                      duration: 0.35,
                      ease: [0.25, 1, 0.5, 1],
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, { offset, velocity }) => {
                      const swipe = Math.abs(offset.x) * velocity.x;
                      if (swipe < -100 || offset.x < -40) {
                        handleNextImage();
                      } else if (swipe > 100 || offset.x > 40) {
                        handlePrevImage();
                      }
                    }}
                    className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <SafeImage
                      src={currentActiveImage}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-300 hover:scale-105 pointer-events-none select-none"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Slider Prev / Next Arrows */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white shadow-md border border-stone-200 text-stone-700 flex items-center justify-center transition-all cursor-pointer z-10 hover:scale-108 active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 text-stone-700" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white shadow-md border border-stone-200 text-stone-700 flex items-center justify-center transition-all cursor-pointer z-10 hover:scale-108 active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 text-stone-700" />
                </button>

                {/* Stock Out Badge on Image */}
                {isOutOfStock && (
                  <div className="absolute top-3 left-3 z-20">
                    <span className="px-3 py-1 bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md">
                      স্টক আউট
                    </span>
                  </div>
                )}

                {/* Wishlist & Compare Icons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(product)}
                    className={`p-2 rounded-full shadow-xs transition-colors cursor-pointer ${
                      isWishlisted
                        ? 'bg-rose-50 text-rose-500 border border-rose-200'
                        : 'bg-white/90 text-stone-400 hover:text-rose-500 border border-stone-200'
                    }`}
                    title={isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>

                  {onToggleCompare && (
                    <button
                      type="button"
                      onClick={() => onToggleCompare(product)}
                      className={`p-2 rounded-full shadow-xs transition-colors cursor-pointer ${
                        isCompared
                          ? 'bg-[#f38018] text-white border border-[#f38018]'
                          : 'bg-white/90 text-stone-400 hover:text-[#f38018] border border-stone-200'
                      }`}
                      title={isCompared ? 'In Comparison (তুলনা থেকে সরান)' : 'Compare (পণ্য তুলনা করুন)'}
                      aria-label="Toggle compare"
                    >
                      <ArrowLeftRight className="w-4 h-4 stroke-[2.4]" />
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: PRODUCT INFO, PRICE, VARIANT, QUANTITY & BUTTONS */}
            <div className="md:col-span-6 space-y-4">
              
              {/* Category & Subcategory & Rating */}
              <div className="flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold uppercase tracking-wider text-[#f38018] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                    {product.category || 'Featured'}
                  </span>
                  {product.subcategory && (
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {product.subcategory}
                    </span>
                  )}
                </div>
                {enableCustomerReviews ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-stone-800">{averageRating}</span>
                    <span className="text-stone-400">({totalReviewsCount} Reviews)</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    100% Authentic
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 leading-snug">
                {product.name}
              </h1>

              {/* Pricing Row */}
              <div className="flex items-center gap-3 flex-wrap py-1 font-bengali">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#f38018] tracking-tight select-none">
                  ৳{(currentPrice ?? 0).toLocaleString()}
                </span>
                {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                  <span className="text-base sm:text-lg text-stone-400 line-through select-none">
                    ৳{(currentOriginalPrice ?? 0).toLocaleString()}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="text-xs font-bold text-white bg-[#00a86b] px-2.5 py-1 rounded-md shadow-2xs font-sans">
                    Save {discountPercentage}%
                  </span>
                )}
                {isOutOfStock && (
                  <span className="text-xs font-extrabold text-white bg-rose-600 px-2.5 py-1 rounded-md shadow-2xs font-sans uppercase">
                    স্টক আউট (Stock Out)
                  </span>
                )}
              </div>

              <div className="h-px bg-stone-200 w-full" />

              {/* Variant Selector */}
              {parsedVariants.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#f38018]" />
                    Select Weight / Size:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {parsedVariants.map((variant) => {
                      const isSelected = currentVariant === variant.label;
                      return (
                        <button
                          key={variant.label}
                          type="button"
                          onClick={() => setSelectedVariant(variant.label)}
                          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#f38018] text-white border-[#f38018] shadow-xs'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-[#f38018]'
                          }`}
                        >
                          <span>{variant.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 py-1">
                <span className="text-sm font-bold text-stone-800">Quantity:</span>
                
                <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={isOutOfStock || quantity <= 1}
                    className="w-10 h-10 bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center justify-center disabled:opacity-30 transition-colors cursor-pointer border-r border-stone-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-stone-900 font-sans">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={isOutOfStock}
                    className="w-10 h-10 bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center justify-center disabled:opacity-30 transition-colors cursor-pointer border-l border-stone-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs sm:text-sm text-stone-500 font-bengali">
                  Total: <strong className="text-[#f38018] font-bold text-sm sm:text-base">৳{((currentPrice ?? 0) * quantity).toLocaleString()}</strong>
                </span>
              </div>

              {/* 2 Primary Action Buttons: ADD TO CART & BUY NOW */}
              {isOutOfStock ? (
                <div className="pt-2">
                  <div className="w-full py-3.5 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>দুঃখিত, এই পণ্যটি বর্তমানে স্টক আউট (Out of Stock)</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCartClick}
                    className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                      addedAnimation
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#f38018] hover:bg-[#e0700c] text-white active:scale-98'
                    }`}
                    id="btn-add-to-cart-modal"
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>ADD TO CART</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNowClick}
                    className="py-3.5 px-4 rounded-xl bg-[#0d211b] hover:bg-[#06120e] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
                    id="btn-buy-now-modal"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>BUY NOW</span>
                  </button>
                </div>
              )}

              {/* Compare Button */}
              {onToggleCompare && (
                <button
                  type="button"
                  onClick={() => onToggleCompare(product)}
                  className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer font-bengali ${
                    isCompared
                      ? 'bg-orange-50 border-[#f38018] text-[#f38018]'
                      : 'border-stone-200 text-stone-700 hover:border-[#f38018] hover:text-[#f38018] bg-stone-50/50'
                  }`}
                  id="btn-compare-modal"
                >
                  <ArrowLeftRight className="w-4 h-4 stroke-[2.2]" />
                  <span>{isCompared ? 'তুলনা তালিকা থেকে সরান (In Comparison)' : 'অন্য পণ্যের সাথে তুলনা করুন (Compare Product)'}</span>
                </button>
              )}

            </div>

          </div>
        </div>

        {/* 3. PRODUCT DESCRIPTION (ONLY REAL ENGLISH DESCRIPTION) */}
        {product.description && (
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-7 space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
              Product Description
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* 4. CUSTOMER REVIEWS & RATINGS SECTION (TOGGLEABLE VIA ADMIN) */}
        {enableCustomerReviews && (
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900">
                    Customer Reviews & Ratings
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    গ্রাহকদের রিভিউ
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(Number(averageRating)) ? 'fill-amber-400' : 'text-stone-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-800 font-sans">{averageRating} out of 5</span>
                  <span className="text-xs text-stone-400">({totalReviewsCount} ratings)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-[#0A3828] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                id="btn-open-review-form"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>{isReviewFormOpen ? 'Cancel' : 'Write a Review (রিভিউ দিন)'}</span>
              </button>
            </div>

            {/* Review Submission Form */}
            {isReviewFormOpen && (
              <form onSubmit={handleReviewSubmit} className="bg-stone-50/80 p-4 sm:p-5 rounded-xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                    Share your experience with this product
                  </h4>
                  <span className="text-[11px] text-stone-400">Verified Customer</span>
                </div>

                {reviewSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">আপনার রিভিউ সফলভাবে যুক্ত হয়েছে!</p>
                      <p className="text-[11px] text-emerald-700">Thank you for your valuable feedback.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Star Rating selector */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Your Rating (রেটিং দিন) <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110"
                            title={`${star} Star`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-stone-600 ml-2">
                          {reviewRating === 5 ? 'Excellent (৫/৫)' : `${reviewRating} Star`}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Your Name (আপনার নাম) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder="e.g. তানভীর আহমেদ / Md. Tanvir"
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#0A3828] focus:ring-1 focus:ring-[#0A3828]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          City / District (শহর / জেলা)
                        </label>
                        <input
                          type="text"
                          value={reviewCity}
                          onChange={(e) => setReviewCity(e.target.value)}
                          placeholder="e.g. ঢাকা / চট্টগ্রাম / Sylhet"
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#0A3828] focus:ring-1 focus:ring-[#0A3828]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Detailed Review (আপনার মতামত লিখুন) <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="পণ্যটির গুণগত মান, ঘ্রাণ ও প্যাকেজিং সম্পর্কে আপনার অভিজ্ঞতা লিখুন..."
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#0A3828] focus:ring-1 focus:ring-[#0A3828] resize-none"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={reviewSaving}
                        className="px-5 py-2.5 rounded-xl bg-[#0A3828] hover:bg-[#06241a] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                        id="btn-submit-review"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{reviewSaving ? 'জমা হচ্ছে...' : 'Submit Review (রিভিউ জমা দিন)'}</span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

            {/* List of Reviews */}
            <div className="space-y-3">
              {productReviews.length > 0 ? (
                productReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-stone-50/60 border border-stone-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#0A3828] text-amber-400 font-bold text-[11px] flex items-center justify-center shadow-2xs">
                          {rev.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-900">{rev.customerName}</span>
                            {rev.verifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400">
                            {rev.city ? `${rev.city} • ` : ''}{rev.createdAt}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= rev.rating ? 'fill-amber-400' : 'text-stone-200'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed font-normal pl-9">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-stone-50/50 rounded-xl border border-dashed border-stone-200 space-y-2">
                  <MessageSquare className="w-6 h-6 text-stone-300 mx-auto" />
                  <p className="text-xs font-medium text-stone-600">
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsReviewFormOpen(true)}
                    className="text-xs font-bold text-[#f38018] hover:underline cursor-pointer"
                  >
                    + Write the first review
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. RELATED PRODUCTS SECTION */}
        {displayRelated.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900">
                  Related Products
                </h3>
                <p className="text-xs text-stone-500">You may also like these items</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {displayRelated.map((item) => {
                const itemVariants = parseVariantOptions(item.sizes || []);
                const itemBaseVariant = itemVariants.length > 0 ? itemVariants[0].label : (item.weight || '');
                const itemPrice = getCalculatedPrice(item.price, itemBaseVariant, itemBaseVariant);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleRelatedProductClick(item)}
                    className="bg-white rounded-xl border border-stone-200 hover:border-[#f38018] p-3 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-stone-50 mb-2.5 flex items-center justify-center p-2">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
                        loading="lazy"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        referrerPolicy="no-referrer"
                      />
                      {/* Level 1: Transparent Shield on Related Product */}
                      <div 
                        className="img-shield cursor-pointer"
                        onContextMenu={(e) => e.preventDefault()}
                        aria-hidden="true"
                      />
                      {item.badge && (
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-bold bg-[#f38018] text-white rounded z-10">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400">
                          {item.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-[#f38018] transition-colors">
                          {item.name}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-black text-[#f38018] font-sans">
                          ৳{itemPrice.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(item, 1);
                          }}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#f38018] hover:text-white text-stone-700 transition-colors cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* 5. ACTUAL WEBSITE FOOTER (MATCHING EXACT MAIN APP FOOTER) */}
      <footer className="bg-stone-900 text-stone-300 text-xs border-t border-stone-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Col 1: Brand Info */}
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-bold shadow-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-stone-100 tracking-wider font-serif block" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
                      AL BARAKAH
                    </span>
                    <span className="text-[9px] tracking-[0.22em] text-amber-400 font-semibold uppercase block">
                      PREMIUM
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <p className="text-amber-400 font-bold text-xs tracking-wide">
                    “বরকতের সাথে বিশুদ্ধতা”
                  </p>
                  <p className="text-stone-400 text-[11px] italic">
                    • Purity with Blessing •
                  </p>
                </div>
              </div>

              <p className="text-stone-400 text-xs leading-relaxed">
                Al Barakah Premium is a luxury Islamic brand based in Bangladesh, offering high-end alcohol-free attars and authentic products.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-xs text-amber-400 tracking-wider uppercase border-b border-stone-800 pb-1.5">
                QUICK LINKS
              </h4>
              <ul className="space-y-1.5 text-stone-300">
                <li>
                  <button 
                    onClick={onClose} 
                    className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-amber-500/80" />
                    <span>Home</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onClose} 
                    className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-amber-500/80" />
                    <span>Shop All Products</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      if (onOpenPolicy) onOpenPolicy();
                    }} 
                    className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-amber-500/80" />
                    <span>Privacy & Return Policy</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      if (onOpenPolicy) onOpenPolicy();
                    }} 
                    className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-amber-500/80" />
                    <span>Terms & Conditions</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact Info */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-xs text-amber-400 tracking-wider uppercase border-b border-stone-800 pb-1.5">
                CONTACT INFO
              </h4>
              <ul className="space-y-2.5 text-stone-300">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Tongi BSCIC, Gazipur, Bangladesh.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href="tel:01316534171" className="hover:text-amber-300 font-medium transition-colors">
                    01316534171
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href="mailto:info@albarakahpremium.com" className="hover:text-amber-300 transition-colors">
                    info@albarakahpremium.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-amber-400 shrink-0" />
                  <a 
                    href="https://www.facebook.com/share/19EEJXoVg1/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-amber-300 font-semibold transition-colors underline decoration-amber-500/50 underline-offset-2"
                  >
                    Al Barakah Premium
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Payment Gateways */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-xs text-amber-400 tracking-wider uppercase border-b border-stone-800 pb-1.5">
                PAYMENT GATEWAYS
              </h4>
              <p className="text-stone-400 text-xs mt-2 mb-2.5 leading-relaxed">
                We support trusted local payment methods in Bangladesh:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-stone-800/90 border border-stone-700/90 rounded-lg px-3 py-2 flex items-center gap-2 shadow-xs hover:border-amber-500/50 transition-colors">
                  <div className="w-6 h-6 rounded bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black tracking-tight text-stone-100 uppercase leading-none">
                      Cash On Delivery
                    </div>
                    <div className="text-[9px] text-stone-400 font-medium">হাতে পেয়ে মূল্য পরিশোধ</div>
                  </div>
                </div>

                <div className="bg-stone-800/90 border border-stone-700/90 rounded-lg px-3 py-2 flex items-center gap-2 shadow-xs hover:border-pink-500/50 transition-colors">
                  <div className="w-6 h-6 rounded bg-[#E2136E]/10 border border-[#E2136E]/40 flex items-center justify-center text-[#E2136E] font-black text-xs">
                    ৳
                  </div>
                  <div>
                    <div className="text-[11px] font-black tracking-tight text-white leading-none flex items-center gap-1">
                      <span className="text-[#ff2e8c]">bKash</span>
                      <span className="text-stone-300 font-bold text-[10px]">বিকাশ</span>
                    </div>
                    <div className="text-[9px] text-stone-400 font-medium">Instant Direct Payment</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-6 mt-6 border-t border-stone-800/90 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
            <div className="text-center md:text-left">
              © 2026 <strong className="text-amber-400 font-semibold">AL BARAKAH PREMIUM</strong>. All Rights Reserved.
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-stone-300">
              <button 
                onClick={() => {
                  if (onOpenPolicy) onOpenPolicy();
                }} 
                className="hover:text-amber-400 cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-stone-700">|</span>
              <button 
                onClick={() => {
                  if (onOpenPolicy) onOpenPolicy();
                }} 
                className="hover:text-amber-400 cursor-pointer transition-colors"
              >
                Return Policy
              </button>
              <span className="text-stone-700">|</span>
              <button 
                onClick={() => {
                  if (onOpenPolicy) onOpenPolicy();
                }} 
                className="hover:text-amber-400 cursor-pointer transition-colors"
              >
                Terms & Conditions
              </button>
            </div>

            <div className="text-center md:text-right">
              Developed by <strong className="text-amber-400 font-semibold">AL BARAKAH PREMIUM</strong>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
