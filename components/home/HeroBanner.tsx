'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SafeImage } from '@/components/shared/SafeImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroBannerConfig, HeroSlide, PromoCard, Product } from '@/types';
import { DEFAULT_HERO_CONFIG } from '@/lib/constants/heroDefaults';


interface HeroBannerProps {
  config?: HeroBannerConfig;
  onNavigate: (targetType: 'category' | 'product' | 'all', targetValue: string) => void;
  onOpenProductModal?: (product: Product) => void;
  products?: Product[];
  currency?: 'USD' | 'BDT';
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  config = DEFAULT_HERO_CONFIG,
  onNavigate,
  onOpenProductModal,
  products = [],
}) => {
  const activeSlides = (config?.slides || DEFAULT_HERO_CONFIG.slides).filter((s) => s.enabled);
  const promoCard = config?.promoCard || DEFAULT_HERO_CONFIG.promoCard;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Keep current slide within valid bounds
  useEffect(() => {
    if (currentSlide >= activeSlides.length && activeSlides.length > 0) {
      setCurrentSlide(0);
    }
  }, [activeSlides.length, currentSlide]);

  // Auto sliding carousel
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, activeSlides.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) {
      if (activeSlides.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
      }
    } else if (diff < -50) {
      if (activeSlides.length > 0) {
        setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
      }
    }
    touchStartX.current = null;
  };

  const handleClickItem = (targetType: 'category' | 'product' | 'all', targetValue: string) => {
    if (targetType === 'product' && targetValue && onOpenProductModal) {
      const foundProduct = products.find((p) => p.id === targetValue || p.name.toLowerCase().includes(targetValue.toLowerCase()));
      if (foundProduct) {
        onOpenProductModal(foundProduct);
        return;
      }
    }
    onNavigate(targetType, targetValue);
  };

  const currentSlideItem = activeSlides[currentSlide] || activeSlides[0] || DEFAULT_HERO_CONFIG.slides[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 pb-2 select-none">
      
      {/* Container: Ghorer Bazar Clean Layout (Left: ~67% Slider, Right: ~33% Promo Card) */}
      <div className="w-full flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch">
        
        {/* ============================================================ */}
        {/* 1. LEFT MAIN SLIDER BANNER (67% width on desktop) */}
        {/* ============================================================ */}
        <div 
          className="w-full lg:w-[67%] relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-stone-200/90 bg-[#FBFBF9] aspect-[16/7] sm:aspect-[16/6.5] lg:aspect-auto lg:h-[235px] xl:h-[250px] flex items-center justify-center cursor-pointer group transition-all"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => handleClickItem(currentSlideItem.targetType, currentSlideItem.targetValue)}
          title={`Click to view ${currentSlideItem.targetValue || 'category'}`}
          id="hero-main-slider"
        >
          {/* Smooth Sliding Track for All Active Slides (Glides in from Right) */}
          <div 
            className="flex w-full h-full transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {activeSlides.map((slide) => (
              <div
                key={slide.id}
                className="w-full h-full shrink-0 flex items-center justify-center bg-[#fdfcf9] relative overflow-hidden"
              >
                <SafeImage
                  src={slide.image}
                  alt={slide.title || 'Banner'}
                  className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 pointer-events-none select-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  referrerPolicy="no-referrer"
                />
                {/* Level 1: Transparent Shield Layer over Slide */}
                <div 
                  className="img-shield cursor-pointer"
                  onContextMenu={(e) => e.preventDefault()}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>

          {/* Left Arrow Button (<) - Clean Ghorer Bazar Style */}
          {activeSlides.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white/90 hover:bg-white text-[#FF6A00] flex items-center justify-center transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95 border border-stone-200/80"
              id="hero-slider-prev-btn"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          )}

          {/* Right Arrow Button (>) - Clean Ghorer Bazar Style */}
          {activeSlides.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Slide"
              className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white/90 hover:bg-white text-[#FF6A00] flex items-center justify-center transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95 border border-stone-200/80"
              id="hero-slider-next-btn"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          )}

          {/* Pagination Dots at Bottom Left (Clean Ghorer Bazar Orange Accent) */}
          {activeSlides.length > 1 && (
            <div className="absolute bottom-2 left-3 sm:left-4 z-20 flex items-center gap-1 bg-black/20 backdrop-blur-xs px-2 py-0.5 rounded-full">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all rounded-full cursor-pointer ${
                    idx === currentSlide 
                      ? 'w-3.5 sm:w-4 h-1 sm:h-1.5 bg-[#FF6A00]' 
                      : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/80 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 2. RIGHT PROMO BANNER CARD (Desktop only - Hidden on mobile/tablet) */}
        {/* ============================================================ */}
        {promoCard && promoCard.enabled && (
          <div 
            className="hidden lg:flex lg:w-[33%] relative rounded-2xl overflow-hidden shadow-xs border border-stone-200/90 bg-[#FBFBF9] lg:h-[235px] xl:h-[250px] items-center justify-center cursor-pointer group transition-all"
            onClick={() => handleClickItem(promoCard.targetType, promoCard.targetValue)}
            title={`Click to view ${promoCard.targetValue || 'category'}`}
            id="hero-right-promo-card"
          >
            {/* Clean Promo Graphic Image with Level 1 Shield */}
            <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center bg-[#fdfcf9]">
              <SafeImage
                src={promoCard.image}
                alt={promoCard.title || 'Promo Banner'}
                className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 pointer-events-none select-none"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                referrerPolicy="no-referrer"
              />
              {/* Level 1: Transparent Shield Layer over Promo Card */}
              <div 
                className="img-shield cursor-pointer"
                onContextMenu={(e) => e.preventDefault()}
                aria-hidden="true"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

