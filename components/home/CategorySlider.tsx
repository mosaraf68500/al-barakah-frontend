'use client';

import React, { useRef, useEffect, useState } from 'react';
import { SafeImage } from '@/components/shared/SafeImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CategoryItem, Category } from '@/types';

interface CategorySliderProps {
  categories: CategoryItem[];
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  onOpenAdmin?: () => void;
}

export const CategorySlider: React.FC<CategorySliderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Filter only enabled categories (unique items)
  const activeCategories = categories.filter((c) => c.enabled);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    
    // Each step scrolls approximately 1-2 cards width + gap
    const scrollStep = 135;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    if (direction === 'right') {
      if (container.scrollLeft >= maxScrollLeft - 10) {
        // Smoothly loop back to start
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft <= 10) {
        container.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      }
    }
  };

  // Auto-rolling effect: rolls every 2 seconds
  useEffect(() => {
    if (isPaused || activeCategories.length <= 1) return;

    const interval = setInterval(() => {
      handleScroll('right');
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused, activeCategories.length]);

  if (activeCategories.length === 0) return null;

  return (
    <section 
      className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      id="featured-categories-section"
    >
      {/* Prominent Header Section (Exact font and styling from Ghorer Bazar) */}
      <div className="w-full text-center mb-3 sm:mb-4">
        <h2 
          className="text-lg sm:text-2xl font-semibold text-[#1e293b] tracking-normal block"
          style={{ fontFamily: "'Open Sans', 'Plus Jakarta Sans', 'Rubik', sans-serif" }}
          id="featured-categories-title"
        >
          Featured Categories
        </h2>
      </div>

      {/* Slider Carousel Container */}
      <div className="relative group">
        
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          aria-label="Previous Categories"
          className="absolute -left-1 sm:-left-3.5 top-[38%] -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#FF6A00] hover:bg-[#E55F00] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-orange-200"
          id="category-slide-prev-btn"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          aria-label="Next Categories"
          className="absolute -right-1 sm:-right-3.5 top-[38%] -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#FF6A00] hover:bg-[#E55F00] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-orange-200"
          id="category-slide-next-btn"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-start gap-2.5 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth py-1.5 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activeCategories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className="shrink-0 w-[96px] sm:w-[120px] md:w-[125px] flex flex-col items-center cursor-pointer group/card"
                id={`cat-card-${cat.slug}`}
              >
                {/* Square Card Box with Image */}
                <div 
                  className={`w-[96px] h-[96px] sm:w-[120px] sm:h-[120px] rounded-2xl p-1.5 sm:p-2 bg-white border transition-all duration-200 flex items-center justify-center shadow-xs group-hover/card:shadow-md ${
                    isSelected
                      ? 'border-[#FF6A00] ring-2 ring-[#FF6A00]/30 shadow-md'
                      : 'border-stone-200/90 group-hover/card:border-[#FF6A00]/60'
                  }`}
                >
                  <div className="w-full h-full rounded-xl overflow-hidden bg-stone-100 relative">
                    <SafeImage
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300 pointer-events-none select-none"
                      loading="lazy"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    {/* Level 1: Transparent Shield over Category Item */}
                    <div 
                      className="img-shield cursor-pointer"
                      onContextMenu={(e) => e.preventDefault()}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Category Title Below Card */}
                <span 
                  className={`w-full text-xs sm:text-sm font-medium text-center mt-2 transition-colors truncate px-0.5 tracking-normal ${
                    isSelected ? 'text-[#FF6A00] font-semibold' : 'text-[#1e293b] group-hover/card:text-[#FF6A00]'
                  }`}
                  style={{ fontFamily: "'Open Sans', 'Plus Jakarta Sans', 'Rubik', sans-serif" }}
                  title={cat.name}
                >
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
