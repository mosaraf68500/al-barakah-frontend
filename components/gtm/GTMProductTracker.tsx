'use client';

import { useEffect } from 'react';
import { trackViewItem } from '@/lib/gtm';

type GTMProductTrackerProps = {
  itemId: string;
  itemName: string;
  price: number;
  originalPrice?: number;
};

/**
 * Isolated client tracker for product detail views.
 * Safe to render from Server Components or existing client shells — renders nothing.
 */
export function GTMProductTracker({ itemId, itemName, price, originalPrice }: GTMProductTrackerProps) {
  useEffect(() => {
    const discount =
      originalPrice !== undefined && originalPrice > price
        ? Number((originalPrice - price).toFixed(2))
        : undefined;

    trackViewItem({
      value: price,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          price,
          quantity: 1,
          index: 0,
          ...(discount !== undefined ? { discount } : {}),
        },
      ],
    });
  }, [itemId, itemName, price, originalPrice]);

  return null;
}
