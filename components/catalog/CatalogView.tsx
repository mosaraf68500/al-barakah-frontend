'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown, ShoppingBag } from 'lucide-react';
import type { FilterState, HeroBannerConfig, TopSellingSectionConfig } from '@/types';
import { getSubcategoriesForCategory } from '@/lib/constants/subcategories';
import { filterProducts, type SortBy } from '@/lib/catalog/filterProducts';
import { categoryHref } from '@/lib/catalog/urls';
import { useCategories, useProducts, useSettings } from '@/hooks/useStoreData';
import { useStorefrontActions } from '@/hooks/useStorefrontActions';
import { useCompareStore } from '@/store/compareStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUiStore } from '@/store/uiStore';
import { DEFAULT_HERO_CONFIG } from '@/lib/constants/heroDefaults';
import { DEFAULT_TOP_SELLING_CONFIG } from '@/types/topSelling';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategorySlider } from '@/components/home/CategorySlider';
import { TopSellingSection } from '@/components/home/TopSellingSection';
import { ProductCard } from '@/components/product/ProductCard';

const currency = 'BDT' as const; // legacy: setCurrency is never called, currency is always BDT

/**
 * Port of the legacy `App.tsx` CATALOG branch (hero, featured categories, top selling, per-category sections,
 * filtered/search grid, sub-category chips, sort, load-more). Markup/classes are unchanged; state that used to live in
 * App (`filters`, `activePageView`) now lives in the URL: `/` (All), `/category/[slug]`, `?q=`, `?sort=`, `?sub=`.
 */
export function CatalogView({ categoryName }: { categoryName?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const products = useProducts();
  const categories = useCategories();
  const settings = useSettings();
  const actions = useStorefrontActions();
  const wishlist = useWishlistStore((s) => s.items);
  const compareProducts = useCompareStore((s) => s.items);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);

  const [sortBy, setSortBy] = useState<SortBy>((searchParams.get('sort') as SortBy) || 'featured');
  const [subcategory, setSubcategory] = useState<string | undefined>(searchParams.get('sub') || undefined);
  const [visibleProductsCount, setVisibleProductsCount] = useState<number>(15);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Record<string, boolean>>({});

  const category = categoryName ?? 'All';
  const filters: FilterState = {
    category,
    subcategory,
    searchQuery,
    search: searchQuery,
    minPrice: 0,
    maxPrice: 10000,
    minRating: 0,
    sortBy,
    inStockOnly: false,
    onSaleOnly: false,
  };

  // Legacy: reset pagination when category, subcategory, search or sort changes.
  useEffect(() => {
    setVisibleProductsCount(15);
  }, [category, subcategory, searchQuery, sortBy]);

  // Keep ?sort= / ?sub= in the URL (shareable) without a server round-trip.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (sortBy === 'featured') url.searchParams.delete('sort');
    else url.searchParams.set('sort', sortBy);
    if (subcategory) url.searchParams.set('sub', subcategory);
    else url.searchParams.delete('sub');
    if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url.href);
  }, [sortBy, subcategory]);

  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, category, subcategory, searchQuery, sortBy]
  );

  const heroBannerConfig: HeroBannerConfig = useMemo(() => {
    const raw = settings.heroBanners as any;
    if (!raw) return DEFAULT_HERO_CONFIG;
    if (Array.isArray(raw)) return { slides: raw, promoCard: DEFAULT_HERO_CONFIG.promoCard };
    if (Array.isArray(raw.slides)) return { slides: raw.slides, promoCard: raw.promoCard || DEFAULT_HERO_CONFIG.promoCard };
    return raw as HeroBannerConfig;
  }, [settings.heroBanners]);

  // Legacy only replaced the default when the stored config had at least one item.
  const topSellingConfig: TopSellingSectionConfig =
    settings.topSelling && settings.topSelling.items && settings.topSelling.items.length > 0 ? settings.topSelling : DEFAULT_TOP_SELLING_CONFIG;

  const goToCategory = (name: string) => {
    setSubcategory(undefined);
    router.push(categoryHref(name, categories), { scroll: false });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSubcategory(undefined);
    setSortBy('featured');
    router.push('/');
  };

  const changeSort = (v: SortBy) => setSortBy(v);
  const changeSubcategory = (v: string | undefined) => setSubcategory(v);

  const heroNavigate = (targetType: 'category' | 'product' | 'all', targetValue: string) => {
    if (targetType === 'category') {
      setSearchQuery('');
      goToCategory(targetValue);
      const catEl = document.getElementById('catalog-section');
      if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
    } else if (targetType === 'product') {
      const found = products.find((p) => p.id === targetValue || p.name === targetValue);
      if (found) actions.openProduct(found);
    } else {
      setSearchQuery('');
      setSubcategory(undefined);
      router.push('/');
    }
  };

  return (
    <>
    {/* Hero Section (only when on 'All' or no active text search) */}
    {!filters.searchQuery && filters.category === 'All' && (
      <HeroBanner
        config={heroBannerConfig}
        onNavigate={heroNavigate}
        onOpenProductModal={(p) => actions.openProduct(p)}
        products={products}
        currency={currency}
      />
    )}

    {/* Featured Categories Carousel Slider (matching user requested flow & screenshot) */}
    {!filters.searchQuery && (
      <CategorySlider
        categories={categories}
        selectedCategory={filters.category}
        onSelectCategory={(cat) => goToCategory(cat)}
      />
    )}

    {/* Top Selling Products Section (Placed directly below CategorySlider in Ghorer Bazar style) */}
    {!filters.searchQuery && filters.category === 'All' && topSellingConfig.enabled && (
      <TopSellingSection
        config={topSellingConfig}
        products={products}
        compareProducts={compareProducts}
        onToggleCompare={actions.toggleCompare}
        onAddToCart={(p, qty) => actions.addToCart(p, qty || 1)}
        onBuyNow={(p, qty) => actions.buyNow(p, qty || 1)}
        onOpenProductModal={(p) => actions.openProduct(p)}
      />
    )}

    {/* Main Content Area: Clean Ghorer Bazar Full-Width Product Grid */}
    <main id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Section Header & Sort controls (shown when filtering by category or searching) */}
        {(filters.category !== 'All' || filters.searchQuery) && (
<div className="space-y-4 pb-4 mb-6 border-b border-stone-200/80">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
          {filters.category === 'All' ? 'All Products' : `${filters.category}`}
        </h2>
        {filters.searchQuery && (
          <span className="text-xs font-normal text-stone-500">
            - "{filters.searchQuery}"
          </span>
        )}
      </div>
      <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
        Showing {filteredProducts.length} premium items with doorstep delivery
      </p>
    </div>

    {/* Sort Dropdown & Back to All */}
    <div className="flex items-center gap-2 self-start sm:self-auto">
      <button
        onClick={() => resetFilters()}
        className="text-xs font-bold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors cursor-pointer"
      >
        All Categories
      </button>
      <div className="flex items-center gap-1.5 bg-white border border-stone-200/90 rounded-lg px-2.5 py-1.5 shadow-xs">
        <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
        <label className="text-xs text-stone-500 font-medium hidden sm:inline">Sort by:</label>
        <select
          value={filters.sortBy}
          onChange={(e) => changeSort(e.target.value as SortBy)}
          className="text-xs font-semibold text-stone-800 bg-transparent focus:outline-none cursor-pointer"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="newest">New Arrivals</option>
        </select>
      </div>
    </div>
  </div>

  {/* Sub-category Filter Tabs for Medicine & Health (and other subcategory-enabled categories) */}
  {(() => {
    const availableSubs = getSubcategoriesForCategory(filters.category);
    if (availableSubs.length === 0) return null;

    return (
      <div className="bg-stone-50/80 p-3 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0a5c36]" />
            Select Sub-category:
          </span>
          {filters.subcategory && filters.subcategory !== 'all' && (
            <button
              onClick={() => changeSubcategory(undefined)}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              Show All
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* All Subcategories Button */}
          <button
            type="button"
            onClick={() => changeSubcategory(undefined)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              !filters.subcategory || filters.subcategory === 'all'
                ? 'bg-[#0a5c36] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <span>All Items</span>
          </button>

          {/* Dynamic Subcategory Chips */}
          {availableSubs.map((sub) => {
            const isSelected = filters.subcategory?.trim().toLowerCase() === sub.name.trim().toLowerCase();
            const matchCount = products.filter((p) => {
              if (p.category?.trim().toLowerCase() !== filters.category.trim().toLowerCase()) return false;
              const pSub = (p.subcategory || '').trim().toLowerCase();
              const sName = sub.name.trim().toLowerCase();
              return pSub === sName;
            }).length;

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => changeSubcategory(sub.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0a5c36] text-white shadow-xs ring-2 ring-emerald-600/30'
                    : 'bg-white text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 border border-stone-200 hover:border-emerald-300'
                }`}
              >
                <span>{sub.name}</span>
                {matchCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-[#D4AF37] text-stone-950' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {matchCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  })()}
</div>
        )}

        {/* Full-Width Products Content */}
        <div className="w-full">
{filters.category === 'All' && !filters.searchQuery ? (
  /* Category-by-Category Sections in Strict Order */
  <div className="space-y-12 sm:space-y-14">
    {categories.filter((c) => c.enabled).map((cat) => {
      const catProducts = products.filter(
        (p) => p.category?.toLowerCase() === cat.name.toLowerCase() || p.category === cat.name
      );

      if (catProducts.length === 0) return null;

      const isSpecialSection = cat.name.toLowerCase() === 'combo' || cat.name.toLowerCase() === 'offer zone';
      const isOfferZone = cat.name.toLowerCase() === 'offer zone';
      const isExpanded = !!expandedCategoryIds[cat.id];
      const displayProducts = isExpanded ? catProducts : catProducts.slice(0, 10);
      const hasMore = catProducts.length > 10;

      if (isSpecialSection) {
        return (
          <section 
            key={cat.id} 
            className={`space-y-5 p-4 sm:p-6 rounded-2xl border transition-all ${
              isOfferZone 
                ? 'bg-gradient-to-b from-rose-50/60 via-amber-50/30 to-white border-rose-200/80 shadow-[0_4px_20px_-4px_rgba(225,29,72,0.08)]' 
                : 'bg-gradient-to-b from-amber-50/70 via-emerald-50/20 to-white border-amber-200/80 shadow-[0_4px_20px_-4px_rgba(217,119,6,0.08)]'
            }`}
          >
            {/* Special Centered Header */}
            <div className="flex flex-col items-center justify-center text-center space-y-1.5 pb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-2xs bg-white border border-stone-200">
                <span className="w-2 h-2 rounded-full animate-ping mr-0.5 inline-block" style={{ backgroundColor: isOfferZone ? '#e11d48' : '#d97706' }} />
                <span className={isOfferZone ? 'text-rose-700' : 'text-amber-700'}>
                  {cat.badge || (isOfferZone ? 'Flash Discount' : 'Mega Saver')}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-serif flex items-center justify-center gap-2">
                <span>{cat.name}</span>
              </h3>

              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {isOfferZone 
                  ? 'Special limited time promotional discounts on hand-picked authentic essentials'
                  : 'Exclusive bundled packages designed to give you maximum value and savings'}
              </p>

              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={() => {
                    goToCategory(cat.name);
                    const catSec = document.getElementById('catalog-section');
                    if (catSec) catSec.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                    isOfferZone 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs' 
                      : 'bg-[#0a5c36] hover:bg-[#08482a] text-white shadow-xs'
                  }`}
                >
                  <span>Explore All {cat.name}</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  isWishlisted={wishlist.some((p) => p.id === product.id)}
                  onToggleWishlist={actions.toggleWishlist}
                  isCompared={compareProducts.some((p) => p.id === product.id)}
                  onToggleCompare={actions.toggleCompare}
                  onAddToCart={(p, qty = 1) => actions.addToCart(p, qty)}
                  onBuyNow={(p, qty = 1) => actions.buyNow(p, qty)}
                  onQuickView={(p) => actions.openProduct(p)}
                />
              ))}
            </div>

            {/* Load More for Category */}
            {hasMore && (
              <div className="pt-3 pb-1 flex justify-center">
                <button
                  onClick={() => {
                    setExpandedCategoryIds((prev) => ({
                      ...prev,
                      [cat.id]: !isExpanded,
                    }));
                  }}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  {isExpanded ? (
                    <>
                      <span>সংক্ষিপ্ত করুন (Show Less)</span>
                      <span>↑</span>
                    </>
                  ) : (
                    <>
                      <span>আরও দেখুন ({catProducts.length - 10}+ টি প্রোডাক্ট)</span>
                      <span>↓</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        );
      }

      return (
        <section key={cat.id} className="space-y-4">
          {/* Standard Category Section Header */}
          <div className="flex items-center justify-between border-b border-stone-200/90 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-6 bg-[#0a5c36] rounded-full" />
              <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                {cat.name}
              </h3>
              {cat.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  {cat.badge}
                </span>
              )}
              <span className="text-[11px] text-stone-400 font-medium hidden xs:inline">
                ({catProducts.length} items)
              </span>
            </div>

            <button
              onClick={() => {
                goToCategory(cat.name);
                const catSec = document.getElementById('catalog-section');
                if (catSec) catSec.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-bold text-[#0a5c36] hover:text-[#08482a] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                isWishlisted={wishlist.some((p) => p.id === product.id)}
                onToggleWishlist={actions.toggleWishlist}
                isCompared={compareProducts.some((p) => p.id === product.id)}
                onToggleCompare={actions.toggleCompare}
                onAddToCart={(p, qty = 1) => actions.addToCart(p, qty)}
                onBuyNow={(p, qty = 1) => actions.buyNow(p, qty)}
                onQuickView={(p) => actions.openProduct(p)}
              />
            ))}
          </div>

          {/* Load More for Regular Category */}
          {hasMore && (
            <div className="pt-3 flex justify-center">
              <button
                onClick={() => {
                  setExpandedCategoryIds((prev) => ({
                    ...prev,
                    [cat.id]: !isExpanded,
                  }));
                }}
                className="px-5 py-2 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200/90 text-stone-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                {isExpanded ? (
                  <>
                    <span>সংক্ষিপ্ত করুন (Show Less)</span>
                    <span>↑</span>
                  </>
                ) : (
                  <>
                    <span>আরও {cat.name} দেখুন ({catProducts.length - 10}+)</span>
                    <span>↓</span>
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      );
    })}
  </div>
) : filteredProducts.length === 0 ? (
  <div className="bg-white rounded-2xl border border-stone-200/90 p-12 text-center space-y-4 shadow-xs max-w-md mx-auto my-8">
    <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
      <ShoppingBag className="w-7 h-7" />
    </div>
    <div className="space-y-1.5">
      <h3 className="font-bold text-stone-900 text-base">No Products Found</h3>
      <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
        {filters.subcategory
          ? `There are currently no products in the "${filters.subcategory}" sub-category.`
          : "We couldn't find any products matching your active category or search query."}
      </p>
    </div>
    <div className="flex items-center justify-center gap-2 pt-2">
      {filters.subcategory && (
        <button
          onClick={() => changeSubcategory(undefined)}
          className="px-4 py-2 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold hover:bg-stone-200 transition-colors cursor-pointer"
        >
          View All {filters.category}
        </button>
      )}
      <button
        onClick={() => resetFilters()}
        className="px-4 py-2 rounded-xl bg-[#0a5c36] text-white text-xs font-bold hover:bg-[#08482a] transition-colors cursor-pointer shadow-xs"
      >
        View All Products
      </button>
    </div>
  </div>
) : (
  <div className="space-y-8">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {filteredProducts.slice(0, visibleProductsCount).map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currency={currency}
          searchQuery={filters.searchQuery}
          isWishlisted={wishlist.some((p) => p.id === product.id)}
          onToggleWishlist={actions.toggleWishlist}
          isCompared={compareProducts.some((p) => p.id === product.id)}
          onToggleCompare={actions.toggleCompare}
          onAddToCart={(p, qty = 1) => actions.addToCart(p, qty)}
          onBuyNow={(p, qty = 1) => actions.buyNow(p, qty)}
          onQuickView={(p) => actions.openProduct(p)}
        />
      ))}
    </div>

    {/* Load More Products Controls for Filtered / Category / Search View */}
    {filteredProducts.length > 15 && (
      <div className="pt-6 pb-2 border-t border-stone-200/80 flex flex-col items-center space-y-3">
        <div className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
          <span>প্রদর্শিত হচ্ছে</span>
          <span className="text-stone-900 font-bold font-mono">
            {Math.min(visibleProductsCount, filteredProducts.length)}
          </span>
          <span>/</span>
          <span className="text-stone-900 font-bold font-mono">{filteredProducts.length}</span>
          <span>টি প্রোডাক্ট</span>
        </div>

        {/* Progress bar */}
        <div className="w-48 sm:w-64 h-1.5 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#0a5c36] transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, (visibleProductsCount / filteredProducts.length) * 100)}%` }}
          />
        </div>

        {visibleProductsCount < filteredProducts.length ? (
          <button
            onClick={() => setVisibleProductsCount((prev) => prev + 15)}
            className="mt-2 px-8 py-3 rounded-xl bg-[#0a5c36] hover:bg-[#08482a] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md shadow-emerald-950/15 flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <span>আরও প্রোডাক্ট দেখুন (Load More)</span>
            <span>+</span>
          </button>
        ) : (
          <p className="text-xs text-stone-400 font-medium italic pt-1">
            সবগুলো প্রোডাক্ট প্রদর্শিত হয়েছে
          </p>
        )}
      </div>
    )}
  </div>
)}
        </div>
      </main>
    </>
  );
}
