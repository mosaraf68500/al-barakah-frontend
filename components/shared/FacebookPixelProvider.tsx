'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initFacebookPixel, trackFbPageView } from '@/lib/analytics/facebookPixel';
import { useSettings } from '@/hooks/useStoreData';

const viewName = (p: string) => (p === '/cart' ? 'CART' : p === '/track' ? 'TRACK' : p === '/login' ? 'LOGIN' : p === '/wishlist' ? 'WISHLIST' : 'CATALOG');

/** Legacy App.tsx: init the pixel from settings, fire PageView on every view change. No-op unless NEXT_PUBLIC_ENABLE_FB_PIXEL=true. */
export function FacebookPixelProvider() {
  const settings = useSettings();
  const pathname = usePathname();
  useEffect(() => {
    initFacebookPixel(settings.facebookPixelConfig);
  }, [settings.facebookPixelConfig]);
  useEffect(() => {
    trackFbPageView(viewName(pathname));
  }, [pathname]);
  return null;
}
