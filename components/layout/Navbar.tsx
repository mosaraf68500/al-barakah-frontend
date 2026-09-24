'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SafeImage } from '@/components/shared/SafeImage';
import { 
  ShoppingCart, 
  User, 
  Search, 
  X, 
  Heart, 
  MapPin, 
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Menu as MenuIcon,
  LogIn,
  LogOut,
  PhoneCall,
  Package,
  Layers,
  HelpCircle,
  ArrowLeftRight
} from 'lucide-react';
import { Category, CategoryItem, Product } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { AlBarakahLogo } from '@/components/shared/AlBarakahLogo';
import { GhorerBazarCategoryNav } from './CategoryNav';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  compareCount?: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCompare?: () => void;
  onOpenOrders: () => void;
  onOpenCustomerDashboard?: () => void;
  onOpenAuth?: (tab?: 'LOGIN' | 'TRACK') => void;
  categories?: CategoryItem[];
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
}

const TRENDING_SEARCHES = [
  'Royal Attar',
  'Premium Sunglasses',
  'Oud Wood',
  'Sunnah Panjabi',
  'Organic Honey',
  'Luxury Watch',
  'Kafan Cloth',
  'Prayer Mat'
];

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  compareCount = 0,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenCart,
  onOpenWishlist,
  onOpenCompare,
  onOpenOrders,
  onOpenCustomerDashboard,
  onOpenAuth,
  categories = [],
  products = [],
  onSelectProduct,
}) => {
  const { user, profile, openAuthModal, signOut } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedDesktop = searchContainerRef.current?.contains(target);
      const clickedMobile = mobileSearchContainerRef.current?.contains(target);
      if (!clickedDesktop && !clickedMobile) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    if (user) {
      if (onOpenCustomerDashboard) {
        onOpenCustomerDashboard();
      } else if (onOpenAuth) {
        onOpenAuth('LOGIN');
      }
    } else {
      if (onOpenAuth) {
        onOpenAuth('LOGIN');
      } else {
        openAuthModal();
      }
    }
  };

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else if (onOpenAuth) {
      onOpenAuth('LOGIN');
    } else {
      openAuthModal();
    }
  };

  // Live filter results for quick dropdown recommendation
  const searchMatches = searchQuery.trim()
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
        );
      }).slice(0, 5)
    : [];

  const handleSelectSuggestion = (keyword: string) => {
    onSearchChange(keyword);
    setIsSearchFocused(false);
  };

  const handleProductClick = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setIsSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Header Row: Golden Logo on Left | Search Bar in Middle | Cart, Profile, Login, More on Right */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4 md:gap-6 -mx-3 px-3 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 bg-white border-b border-stone-100 shadow-[0_3px_10px_-2px_rgba(0,0,0,0.06)] md:shadow-none md:border-b-0 relative z-10">
          
          {/* 1. Left Brand Logo (Golden AB Arch Logo + Vertical Line + AL BARAKAH + PREMIUM) */}
          <div 
            onClick={() => { onSelectCategory('All'); onSearchChange(''); }}
            className="flex items-center cursor-pointer group select-none shrink-0 gap-1.5 sm:gap-2.5 md:gap-3"
            id="albarakah-logo-button"
          >
            {/* Golden Mosque Arch AB Logo */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlBarakahLogo className="w-full h-full" />
            </div>

            {/* Gold Vertical Accent Line */}
            <div className="h-7 sm:h-8 md:h-9 w-[2px] sm:w-[2.5px] md:w-[3px] bg-[#D4AF37] rounded-full shrink-0" />

            {/* Brand Typography */}
            <div className="flex flex-col justify-center">
              <h1 
                className="text-xs sm:text-base md:text-[22px] font-black tracking-[0.10em] sm:tracking-[0.14em] text-[#0A3828] uppercase leading-none font-serif"
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              >
                AL BARAKAH
              </h1>

              {/* Subtitle: — PREMIUM — */}
              <div className="flex items-center justify-between gap-1 mt-0.5 sm:mt-1">
                <div className="h-[1px] flex-1 bg-[#D4AF37]"></div>
                <span 
                  className="text-[7px] sm:text-[9px] md:text-[10px] font-bold text-[#D4AF37] tracking-[0.22em] sm:tracking-[0.28em] uppercase leading-none font-serif px-0.5 sm:px-1"
                  style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                >
                  PREMIUM
                </span>
                <div className="h-[1px] flex-1 bg-[#D4AF37]"></div>
              </div>
            </div>
          </div>

          {/* 2. Middle Search Bar (Visible on Desktop/Tablet only) */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-2xl mx-3 lg:mx-6 relative min-w-0">
            <div className="relative flex items-center w-full bg-stone-50/90 hover:bg-stone-100/60 focus-within:bg-white border border-stone-200 rounded-full transition-all focus-within:border-stone-400 focus-within:shadow-xs">
              <input
                id="header-search-bar"
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="Search products (e.g. Attar, Sunglasses, Oud...)"
                className="w-full py-2.5 pl-5 pr-12 text-sm text-stone-900 placeholder:text-stone-400 bg-transparent focus:outline-none"
              />

              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-4 p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="absolute right-4 text-stone-400 pointer-events-none">
                  <Search className="w-4 h-4 stroke-[1.8]" />
                </div>
              )}
            </div>

            {/* Smart Search Recommendations Dropdown (Desktop) */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 top-14 bg-white border border-stone-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-150">
                {searchQuery.trim() ? (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2 pb-2 border-b border-stone-100">
                      <span>Products matching "{searchQuery}"</span>
                      <span className="text-[11px] text-stone-400 font-normal">
                        {searchMatches.length} suggested
                      </span>
                    </div>

                    {searchMatches.length > 0 ? (
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {searchMatches.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => handleProductClick(prod)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <SafeImage
                                src={prod.image}
                                alt={prod.name}
                                className="w-9 h-9 rounded-lg object-cover border border-stone-100 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-stone-900 truncate group-hover:text-[#0A3828]">
                                  {prod.name}
                                </p>
                                <p className="text-[10px] text-stone-400">
                                  {prod.category}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-[#0A3828]">
                                ৳{prod.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-stone-400">
                        No direct matches found. Try searching for "Attar", "Watch", or "Honey".
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                      <span>Popular Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-emerald-50 hover:text-[#0A3828] hover:border-emerald-200 border border-transparent text-stone-600 text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Right Icons (Track Order, Wishlist, Cart, Sign In - Exactly matching reference screenshot) */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 shrink-0">
            
            {/* 1. Track Order (MapPin + Track Order) */}
            <button
              onClick={onOpenOrders}
              className="flex flex-col items-center justify-center text-stone-700 hover:text-[#0A3828] transition-colors cursor-pointer group select-none relative"
              id="header-track-order-btn"
              title="Track Your Order"
            >
              <MapPin className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-stone-700 group-hover:text-[#0A3828] transition-colors stroke-[1.5]" />
              <span className="text-[9px] sm:text-[11px] font-medium mt-0.5 text-stone-700 group-hover:text-[#0A3828] tracking-tight whitespace-nowrap">
                Track Order
              </span>
            </button>

            {/* 2. Compare Products */}
            {onOpenCompare && (
              <button
                onClick={onOpenCompare}
                className="flex flex-col items-center justify-center text-stone-700 hover:text-[#f38018] transition-colors cursor-pointer group select-none relative"
                id="header-compare-btn"
                title="Compare Products (পণ্য তুলনা)"
              >
                <div className="relative">
                  <ArrowLeftRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-stone-700 group-hover:text-[#f38018] transition-colors stroke-[1.7]" />
                  {compareCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-3.5 h-3.5 px-1 rounded-full bg-[#f38018] text-white text-[8px] font-black flex items-center justify-center shadow-2xs">
                      {compareCount}
                    </span>
                  )}
                </div>
                <span className="text-[9px] sm:text-[11px] font-medium mt-0.5 text-stone-700 group-hover:text-[#f38018] tracking-tight whitespace-nowrap">
                  Compare
                </span>
              </button>
            )}

            {/* 3. Wishlist (Heart + Wishlist + Count Badge) */}
            <button
              onClick={onOpenWishlist}
              className="flex flex-col items-center justify-center text-stone-700 hover:text-[#0A3828] transition-colors cursor-pointer group select-none relative"
              id="header-wishlist-btn"
              title="Saved Wishlist"
            >
              <div className="relative">
                <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-stone-700 group-hover:text-rose-600 transition-colors stroke-[1.5]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-3.5 h-3.5 px-1 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center shadow-2xs">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[11px] font-medium mt-0.5 text-stone-700 group-hover:text-[#0A3828] tracking-tight">
                Wishlist
              </span>
            </button>

            {/* 4. Cart (ShoppingCart + Cart + Count Badge) */}
            <button
              onClick={onOpenCart}
              className="flex flex-col items-center justify-center text-stone-700 hover:text-[#0A3828] transition-colors cursor-pointer group select-none relative"
              id="header-cart-btn"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-stone-700 group-hover:text-[#0A3828] transition-colors stroke-[1.5]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-3.5 h-3.5 px-1 rounded-full bg-[#FF5722] text-white text-[8px] font-black flex items-center justify-center shadow-2xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[11px] font-medium mt-0.5 text-stone-700 group-hover:text-[#0A3828] tracking-tight">
                Cart
              </span>
            </button>

            {/* 5. Sign In / Profile (User + Sign In / User Name / Admin) */}
            <button
              onClick={handleProfileClick}
              className="flex flex-col items-center justify-center text-stone-700 hover:text-[#0A3828] transition-colors cursor-pointer group select-none relative"
              id="header-profile-btn"
              title={user ? "Customer Dashboard" : "Sign In"}
            >
              {user?.photoURL ? (
                <SafeImage 
                  src={user.photoURL} 
                  alt="User" 
                  className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full object-cover border border-amber-500/50" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-stone-700 group-hover:text-[#0A3828] transition-colors stroke-[1.5]" />
              )}
              <span className="text-[9px] sm:text-[11px] mt-0.5 tracking-tight whitespace-nowrap max-w-[55px] sm:max-w-[65px] truncate font-medium text-stone-700 group-hover:text-[#0A3828]">
                {user ? (profile?.name ? profile.name.split(' ')[0] : 'Profile') : 'Sign In'}
              </span>
            </button>

          </div>
        </div>

        {/* Mobile Dedicated Search Bar (Visible on Mobile only - clean full width below top row) */}
        <div ref={mobileSearchContainerRef} className="md:hidden pb-2.5 pt-2.5 relative">
          <div className="relative flex items-center w-full bg-stone-50/95 hover:bg-stone-100/70 focus-within:bg-white border border-stone-200/90 rounded-full transition-all focus-within:border-[#0A3828]/50 focus-within:shadow-xs">
            <div className="pl-3.5 pr-2 text-stone-400 pointer-events-none flex items-center justify-center shrink-0">
              <Search className="w-4 h-4 text-stone-400 stroke-[1.8]" />
            </div>
            <input
              id="mobile-header-search-bar"
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSearchFocused(true);
              }}
              placeholder="Search products (Attar, Sunglasses, Oud...)"
              className="w-full py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 bg-transparent focus:outline-none font-medium pr-9"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Smart Search Recommendations Dropdown (Mobile) */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-12 bg-white border border-stone-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in duration-150">
              {searchQuery.trim() ? (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2 pb-2 border-b border-stone-100">
                    <span>Products matching "{searchQuery}"</span>
                    <span className="text-[11px] text-stone-400 font-normal">
                      {searchMatches.length} suggested
                    </span>
                  </div>

                  {searchMatches.length > 0 ? (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {searchMatches.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => handleProductClick(prod)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <SafeImage
                              src={prod.image}
                              alt={prod.name}
                              className="w-9 h-9 rounded-lg object-cover border border-stone-100 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-900 truncate group-hover:text-[#0A3828]">
                                {prod.name}
                              </p>
                              <p className="text-[10px] text-stone-400">
                                {prod.category}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-[#0A3828]">
                              ৳{prod.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-stone-400">
                      No direct matches found. Try searching for "Attar", "Watch", or "Honey".
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TRENDING_SEARCHES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 hover:text-[#0A3828] hover:border-emerald-200 border border-transparent text-stone-600 text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Ghorer Bazar Dark Horizontal Category Nav Bar */}
      <GhorerBazarCategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        onSelectSubCategory={(cat, searchTerm) => {
          onSelectCategory(cat);
          if (searchTerm) {
            onSearchChange(searchTerm);
          }
        }}
        customCategories={categories}
      />

      {/* Slide-over "More" Menu Drawer */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <AlBarakahLogo className="w-full h-full" />
                  </div>
                  <div>
                    <h3 
                      className="font-bold text-sm text-[#0A3828] font-serif"
                      style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                    >
                      AL BARAKAH
                    </h3>
                    <p className="text-[9px] text-[#D4AF37] tracking-widest uppercase font-bold font-serif">
                      PREMIUM STORE
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Navigation Links */}
              <div className="py-4 space-y-1">
                {/* 1. Track Order */}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenOrders();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 text-stone-800 text-xs font-bold transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-50 text-[#FF5722] group-hover:bg-[#FF5722] group-hover:text-white transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>Track Your Order</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2. Wishlist */}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenWishlist();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 text-stone-800 text-xs font-bold transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span>My Wishlist ({wishlistCount})</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2.5 Compare Products */}
                {onOpenCompare && (
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenCompare();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 text-stone-800 text-xs font-bold transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-50 text-[#f38018] group-hover:bg-[#f38018] group-hover:text-white transition-colors">
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                      <span>Compare Products ({compareCount}/3)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* 3. Customer Account */}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handleProfileClick();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 text-stone-800 text-xs font-bold transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-[#0A3828] group-hover:bg-[#0A3828] group-hover:text-white transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <span>{user ? 'My Profile & Dashboard' : 'Login / Register'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 4. Categories list */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-3 mb-1">
                    Categories
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {categories.filter(c => c.enabled).slice(0, 6).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectCategory(c.name);
                          setIsMoreMenuOpen(false);
                        }}
                        className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          selectedCategory === c.name 
                            ? 'bg-[#0A3828] text-white font-bold' 
                            : 'hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer with Support (admin shortcut removed - see MIGRATION_PLAN.md Q3) */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <PhoneCall className="w-4 h-4" />
                <span>WhatsApp Customer Support</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
