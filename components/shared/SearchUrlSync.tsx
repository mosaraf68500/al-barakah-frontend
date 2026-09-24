'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/store/uiStore';

const isCatalogPath = (p: string) => p === '/' || p.startsWith('/category/');

/** Mirrors the navbar search text with `?q=` on catalog pages (shareable URLs) and restores it from the URL on load. */
export function SearchUrlSync() {
  const pathname = usePathname();
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setSearchQuery(q);
  }, [pathname, setSearchQuery]);

  useEffect(() => {
    if (!isCatalogPath(window.location.pathname)) return;
    const t = setTimeout(() => {
      const url = new URL(window.location.href);
      if (searchQuery) url.searchParams.set('q', searchQuery);
      else url.searchParams.delete('q');
      if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url.href);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, pathname]);

  return null;
}
