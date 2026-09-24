'use client';

import React from 'react';
import { SafeImage } from '@/components/shared/SafeImage';
import { ArrowLeftRight, X, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Product } from '@/types';

interface CompareFloatingBarProps {
  compareProducts: Product[];
  onOpenCompareModal?: () => void;
  onOpenCompare?: () => void;
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  compareProducts,
  onOpenCompareModal,
  onOpenCompare,
  onRemoveProduct,
  onClearAll,
}) => {
  if (!compareProducts || compareProducts.length === 0) return null;

  const handleOpenModal = () => {
    if (onOpenCompareModal) {
      onOpenCompareModal();
    } else if (onOpenCompare) {
      onOpenCompare();
    }
  };

  return (
    <div 
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl bg-stone-900/95 backdrop-blur-md text-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.25)] border border-stone-700/60 p-2 sm:p-2.5 flex items-center justify-between gap-2 animate-in slide-in-from-bottom-4 duration-300"
      id="floating-compare-bar"
    >
      {/* Left: Indicator & Thumbnails */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-0.5 custom-scrollbar">
        <div className="flex items-center gap-1.5 pl-1 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#f38018] text-white flex items-center justify-center font-bold">
            <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div className="text-left hidden xs:block">
            <div className="text-[11px] font-bold text-stone-200 uppercase tracking-wider font-bengali">
              তুলনা ({compareProducts.length}/3)
            </div>
          </div>
        </div>

        {/* Selected Product Thumbnails */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {compareProducts.map((p) => (
            <div
              key={p.id}
              className="relative group w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white p-0.5 border border-stone-600 flex items-center justify-center shrink-0"
              title={p.name}
            >
              <SafeImage
                src={p.image || (p.images && p.images[0])}
                alt={p.name}
                className="w-full h-full object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveProduct(p.id);
                }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                title="Remove"
                aria-label="Remove item"
              >
                <X className="w-2.5 h-2.5 stroke-[3]" />
              </button>
            </div>
          ))}

          {/* Empty Slots indication */}
          {Array.from({ length: Math.max(0, 3 - compareProducts.length) }).map((_, i) => (
            <div
              key={`empty-slot-dot-${i}`}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-dashed border-stone-600/80 bg-stone-800/50 flex items-center justify-center text-stone-500 text-[10px] shrink-0 font-bengali select-none"
              title="Add another product to compare"
            >
              +{i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onClearAll}
          className="text-stone-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          title="Clear all comparison items"
          aria-label="Clear all"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleOpenModal}
          className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#f38018] hover:bg-[#e0700c] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer font-bengali whitespace-nowrap"
          id="open-compare-modal-btn"
        >
          <span>তুলনা দেখুন</span>
          <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
