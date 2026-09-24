import type { FilterState, Product } from '@/types';

export type SortBy = NonNullable<FilterState['sortBy']>;

/** Verbatim port of legacy `App.tsx` `filteredProducts` (category, subcategory, search, price cap, rating, toggles, sort). */
export function filterProducts(products: Product[], filters: FilterState): Product[] {
  return products
    .filter((prod) => {
      if (filters.category !== 'All' && prod.category !== filters.category) return false;
      if (filters.subcategory && filters.subcategory !== 'all') {
        const pSub = (prod.subcategory || '').trim().toLowerCase();
        const fSub = filters.subcategory.trim().toLowerCase();
        if (!pSub || pSub !== fSub) return false;
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesCategory = prod.category.toLowerCase().includes(q);
        const matchesSubcategory = prod.subcategory ? prod.subcategory.toLowerCase().includes(q) : false;
        const matchesTags = (prod.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesCategory && !matchesSubcategory && !matchesTags) return false;
      }
      if (prod.price > filters.maxPrice) return false; // legacy quirk kept (BUG_FIXES.md "not changed" note)
      if ((filters.minRating ?? 0) > 0 && prod.rating < (filters.minRating ?? 0)) return false;
      if (filters.inStockOnly && !prod.inStock) return false;
      if (filters.onSaleOnly && !prod.originalPrice) return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0);
        default:
          return 0;
      }
    });
}
