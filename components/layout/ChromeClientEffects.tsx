'use client';

import dynamic from 'next/dynamic';
import { useOverlayHistory } from '@/hooks/useOverlayHistory';

const ImageProtection = dynamic(() => import('@/components/shared/ImageProtection').then((m) => m.ImageProtection), {
  ssr: false,
});
const SearchUrlSync = dynamic(() => import('@/components/shared/SearchUrlSync').then((m) => m.SearchUrlSync), {
  ssr: false,
});
const LegacyUrlRedirect = dynamic(() => import('@/components/shared/LegacyUrlRedirect').then((m) => m.LegacyUrlRedirect), {
  ssr: false,
});
const FacebookPixelProvider = dynamic(
  () => import('@/components/shared/FacebookPixelProvider').then((m) => m.FacebookPixelProvider),
  { ssr: false },
);

/**
 * Non-visual client side-effects for the storefront shell.
 * Lazy-loaded so they do not inflate the critical hydration path.
 */
export function ChromeClientEffects() {
  useOverlayHistory();
  return (
    <>
      <ImageProtection />
      <SearchUrlSync />
      <LegacyUrlRedirect />
      <FacebookPixelProvider />
    </>
  );
}
