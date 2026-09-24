import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full animate-pulse space-y-8 py-4">
      {/* 1. Hero Banner Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full h-48 sm:h-72 md:h-96 rounded-2xl bg-stone-200" />
      </div>

      {/* 2. Category Slider Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="h-5 w-36 bg-stone-200 rounded-md" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="shrink-0 w-24 sm:w-28 flex flex-col items-center gap-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-stone-200" />
              <div className="w-14 h-3 bg-stone-200 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Top Selling / Featured Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-stone-200 rounded-md" />
          <div className="h-4 w-20 bg-stone-200 rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border border-stone-200/80 rounded-2xl p-3 space-y-3">
              <div className="w-full aspect-square rounded-xl bg-stone-200" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-stone-200 rounded-sm" />
                <div className="h-3 w-1/2 bg-stone-200 rounded-sm" />
                <div className="h-5 w-1/3 bg-stone-200 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Main Products Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pt-4">
        <div className="h-6 w-40 bg-stone-200 rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="bg-white border border-stone-200/80 rounded-2xl p-3 space-y-3">
              <div className="w-full aspect-square rounded-xl bg-stone-200" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-stone-200 rounded-sm" />
                <div className="h-3 w-1/2 bg-stone-200 rounded-sm" />
                <div className="h-5 w-1/3 bg-stone-200 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
