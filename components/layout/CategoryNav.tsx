'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Flame, 
  Check
} from 'lucide-react';
import { Category, CategoryItem } from '@/types';

interface SubCategoryOption {
  label: string;
  category: Category;
  searchTerm?: string;
}

interface NavCategoryGroup {
  id: string;
  name: string;
  category: Category;
  isHot?: boolean;
  hasDropdown?: boolean;
  subItems?: SubCategoryOption[];
}

interface GhorerBazarCategoryNavProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  onSelectSubCategory?: (category: Category, searchTerm?: string) => void;
  customCategories?: CategoryItem[];
}

export const GhorerBazarCategoryNav: React.FC<GhorerBazarCategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  onSelectSubCategory,
  customCategories = []
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = (id: string, hasDropdown?: boolean) => {
    if (!hasDropdown) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setOpenDropdownId(null);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdownId(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdownId(null);
    }, 180);
  };

  // Subcategory options mapped by category name or slug
  const KNOWN_METADATA: Record<string, { isHot?: boolean; hasDropdown?: boolean; subItems?: SubCategoryOption[] }> = {
    'combo': {
      isHot: true,
      hasDropdown: true,
      subItems: [
        { label: 'Ramadan VIP Gift Combo', category: 'Combo', searchTerm: 'Combo' },
        { label: 'Royal Heritage Watch & Attar Set', category: 'Combo', searchTerm: 'Royal' },
        { label: 'Sunnah & Wellness Package', category: 'Combo', searchTerm: 'Sunnah' }
      ]
    },
    'offer-zone': {
      isHot: true,
      hasDropdown: true,
      subItems: [
        { label: 'Flash Sale (Buy 1 Get 1)', category: 'Offer Zone', searchTerm: 'Flash' },
        { label: 'Clearance Mega Discounts', category: 'Offer Zone', searchTerm: 'Clearance' },
        { label: 'Special Weekly Deals', category: 'Offer Zone', searchTerm: 'Deal' }
      ]
    },
    'organic-foods': {
      hasDropdown: true,
      subItems: [
        { label: 'Sundarban Raw Honey (মধু)', category: 'Organic Foods', searchTerm: 'Honey' },
        { label: 'Premium Honey Nuts VIP', category: 'Organic Foods', searchTerm: 'Honey Nuts' },
        { label: 'Madinah Ajwa & Medjool Dates (খেজুর)', category: 'Organic Foods', searchTerm: 'Dates' },
        { label: 'Organic Chia Seeds & Nuts (চিয়া সিড)', category: 'Organic Foods', searchTerm: 'Chia' },
        { label: 'Pure Mustard Oil & Cow Ghee (ঘি ও তেল)', category: 'Organic Foods', searchTerm: 'Oil' }
      ]
    },
    'premium-watches': {
      hasDropdown: true,
      subItems: [
        { label: 'Eastern Arabic Numerals Automatic', category: 'Premium Watches', searchTerm: 'Arabic' },
        { label: 'Chronograph Rose Gold Edition', category: 'Premium Watches', searchTerm: 'Chronograph' },
        { label: 'Stainless Steel Luxury Timepieces', category: 'Premium Watches', searchTerm: 'Watch' }
      ]
    },
    'luxury-attar': {
      hasDropdown: true,
      subItems: [
        { label: 'Cambodi Dehn Al Oudh (কম্বোডি ওউধ)', category: 'Luxury Attar', searchTerm: 'Oud' },
        { label: 'Musk Al Kaaba & Velvet Musk', category: 'Luxury Attar', searchTerm: 'Musk' },
        { label: 'Taif Organic Rose Attar (গোলাপ আতর)', category: 'Luxury Attar', searchTerm: 'Rose' },
        { label: 'Royal Ambergris & Mukhallat', category: 'Luxury Attar', searchTerm: 'Amber' }
      ]
    },
    'sunnah-products': {
      hasDropdown: true,
      subItems: [
        { label: 'Handcarved Natural Ebony Tasbeeh (তাসবিহ)', category: 'Sunnah Products', searchTerm: 'Tasbeeh' },
        { label: 'Fresh Peelu Miswak Pack (মেসওয়াক)', category: 'Sunnah Products', searchTerm: 'Miswak' },
        { label: 'Velvet Ottoman Prayer Mat (জায়নামাজ)', category: 'Sunnah Products', searchTerm: 'Prayer' },
        { label: 'Ithmid Surma & Sunnah Essential Kits', category: 'Sunnah Products', searchTerm: 'Surma' }
      ]
    },
    'women-collection': {
      hasDropdown: true,
      subItems: [
        { label: 'Dubai Cut Luxury Abaya & Borka', category: 'Women Collection', searchTerm: 'Abaya' },
        { label: 'Premium Georgette & Silk Hijab', category: 'Women Collection', searchTerm: 'Hijab' },
        { label: 'Exclusive Halal Cosmetics & Accessories', category: 'Women Collection', searchTerm: 'Cosmetics' }
      ]
    },
    'medicine-health': {
      hasDropdown: true,
      subItems: [
        { label: 'Cold-Pressed Black Seed Oil (কালোজিরা তেল)', category: 'Medicine & Health', searchTerm: 'Black Seed' },
        { label: 'Organic Herbal Wellness Supplements', category: 'Medicine & Health', searchTerm: 'Herbal' },
        { label: 'Immunity Booster Health Packs', category: 'Medicine & Health', searchTerm: 'Immunity' }
      ]
    },
    'baby-toys': {
      hasDropdown: true,
      subItems: [
        { label: 'Montessori Wooden Puzzles (উডেন পাজল)', category: 'Baby Toys', searchTerm: 'Wooden' },
        { label: 'Plush Rattle & Teething Sets (বেবি র‍্যাটল)', category: 'Baby Toys', searchTerm: 'Plush' },
        { label: 'Islamic Quran & Dua Companion (লার্নিং টয়)', category: 'Baby Toys', searchTerm: 'Learning' },
        { label: 'Wooden Stacking & Sensory Blocks', category: 'Baby Toys', searchTerm: 'Stacker' }
      ]
    }
  };

  // Build the dynamic category navbar items in the exact order requested by the user
  const allNavItems: NavCategoryGroup[] = (customCategories && customCategories.length > 0)
    ? customCategories
        .filter((c) => c.enabled)
        .map((c) => {
          const key = (c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase();
          const meta = KNOWN_METADATA[key] || KNOWN_METADATA[c.name.toLowerCase()] || {};
          return {
            id: c.id || key,
            name: c.name,
            category: c.name,
            isHot: meta.isHot || false,
            hasDropdown: meta.hasDropdown || false,
            subItems: meta.subItems
          };
        })
    : [
        { id: 'combo', name: 'Combo', category: 'Combo', isHot: true, hasDropdown: true, subItems: KNOWN_METADATA['combo'].subItems },
        { id: 'offer-zone', name: 'Offer Zone', category: 'Offer Zone', isHot: true, hasDropdown: true, subItems: KNOWN_METADATA['offer-zone'].subItems },
        { id: 'organic-foods', name: 'Organic Foods', category: 'Organic Foods', hasDropdown: true, subItems: KNOWN_METADATA['organic-foods'].subItems },
        { id: 'premium-watches', name: 'Premium Watches', category: 'Premium Watches', hasDropdown: true, subItems: KNOWN_METADATA['premium-watches'].subItems },
        { id: 'luxury-attar', name: 'Luxury Attar', category: 'Luxury Attar', hasDropdown: true, subItems: KNOWN_METADATA['luxury-attar'].subItems },
        { id: 'sunnah-products', name: 'Sunnah Products', category: 'Sunnah Products', hasDropdown: true, subItems: KNOWN_METADATA['sunnah-products'].subItems },
        { id: 'women-collection', name: 'Women Collection', category: 'Women Collection', hasDropdown: true, subItems: KNOWN_METADATA['women-collection'].subItems },
        { id: 'medicine-health', name: 'Medicine & Health', category: 'Medicine & Health', hasDropdown: true, subItems: KNOWN_METADATA['medicine-health'].subItems },
        { id: 'baby-toys', name: 'Baby Toys', category: 'Baby Toys', hasDropdown: true, subItems: KNOWN_METADATA['baby-toys'].subItems }
      ];
  const scrollListRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollListRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollListRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [allNavItems]);

  const handleNavScroll = (dir: 'left' | 'right') => {
    if (scrollListRef.current) {
      scrollListRef.current.scrollBy({
        left: dir === 'left' ? -220 : 220,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  const handleItemClick = (item: NavCategoryGroup) => {
    setOpenDropdownId(null);
    onSelectCategory(item.category);
    // Scroll to catalog if already down
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubItemClick = (sub: SubCategoryOption, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (onSelectSubCategory) {
      onSelectSubCategory(sub.category, sub.searchTerm);
    } else {
      onSelectCategory(sub.category);
    }
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      ref={navRef}
      className="hidden md:block w-full bg-[#052217] text-white border-b border-[#0d3b2a] select-none sticky top-20 z-30 shadow-md"
      id="ghorer-bazar-category-bar"
    >
      <div className="w-full max-w-7xl mx-auto px-2 lg:px-4 relative flex items-center">
        
        {/* Left Scroll Button (Visible whenever scrolled right) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleNavScroll('left')}
            className="flex p-1.5 rounded-full text-stone-200 bg-[#072a1d] hover:text-white hover:bg-[#0c3827] border border-[#0f4a34] shrink-0 cursor-pointer z-20 mr-1 shadow-sm transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Horizontal Navigation List */}
        <div 
          ref={scrollListRef}
          className="flex-1 flex items-center justify-start lg:justify-center gap-0.5 md:gap-1 lg:gap-1.5 overflow-x-auto scrollbar-none py-0.5 text-[11px] lg:text-xs xl:text-[12.5px] font-medium tracking-normal scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allNavItems.map((item, idx) => {
            const isSelected = selectedCategory === item.category;
            const isOpen = openDropdownId === item.id;
            // For items on the right half, align dropdown to the right to avoid edge cutoff
            const isRightSide = idx >= Math.floor(allNavItems.length / 2);

            return (
              <div
                key={item.id}
                className="relative shrink-0"
                onMouseEnter={() => handleMouseEnter(item.id, item.hasDropdown)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Category Header Button */}
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center gap-1 px-2 md:px-2.5 lg:px-2.5 xl:px-3 py-2.5 whitespace-nowrap text-[11px] lg:text-xs xl:text-[12.5px] font-medium transition-colors cursor-pointer border-b-2 rounded-t-sm ${
                    isSelected
                      ? 'border-[#D4AF37] text-amber-300 font-bold bg-white/10'
                      : 'border-transparent text-stone-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.isHot && (
                    <Flame className="w-3 h-3 text-[#FF6A00] fill-[#FF6A00] animate-pulse shrink-0" />
                  )}
                  <span>{item.name}</span>
                  {item.hasDropdown && (
                    <ChevronDown className={`w-3 h-3 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-300' : ''
                    }`} />
                  )}
                </button>

                {/* Subcategory Dropdown Panel (Ghorer Bazar Style) */}
                {item.hasDropdown && item.subItems && isOpen && (
                  <div 
                    className={`absolute top-full mt-0 w-64 bg-[#072a1d] text-stone-100 rounded-b-xl border border-[#0f4a34] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                      isRightSide ? 'right-0' : 'left-0'
                    }`}
                  >
                    <div className="px-3 py-1.5 border-b border-[#0d3b2a] flex items-center justify-between text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                      <span>{item.name} Categories</span>
                      <span className="text-[10px] text-stone-400 font-normal">Explore</span>
                    </div>

                    <div className="py-1">
                      {/* View All in this category */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:bg-[#0c3827] flex items-center justify-between font-semibold transition-colors cursor-pointer"
                      >
                        <span>All in {item.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                      </button>

                      {/* Sub-items list */}
                      {item.subItems.map((sub, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={(e) => handleSubItemClick(sub, e)}
                          className="w-full text-left px-3 py-1.5 text-xs text-stone-200 hover:text-white hover:bg-[#0c3827] flex items-center justify-between transition-colors cursor-pointer group"
                        >
                          <span className="group-hover:translate-x-0.5 transition-transform">
                            {sub.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Scroll Button (Visible whenever content overflows on the right) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleNavScroll('right')}
            className="flex p-1.5 rounded-full text-stone-200 bg-[#072a1d] hover:text-white hover:bg-[#0c3827] border border-[#0f4a34] shrink-0 cursor-pointer z-20 ml-1 shadow-sm transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

      </div>
    </nav>
  );
};
