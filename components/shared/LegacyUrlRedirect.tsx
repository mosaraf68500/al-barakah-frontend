'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy hash links never reach the server, so they are redirected here (query-string ones are handled in middleware.ts):
 *   /#product-<id|slug>, /#landing-<id|slug>  ->  /product/<id|slug>
 *   /#admin                                     ->  the admin app (NEXT_PUBLIC_ADMIN_URL) or home (admin UI is not in this repo)
 */
export function LegacyUrlRedirect() {
  const router = useRouter();
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const m = hash.match(/^#(?:product|landing)-(.+)$/);
    if (m) {
      router.replace(`/product/${encodeURIComponent(decodeURIComponent(m[1]))}`);
      return;
    }
    if (hash === '#admin') {
      const admin = process.env.NEXT_PUBLIC_ADMIN_URL;
      if (admin) window.location.replace(admin);
      else router.replace('/');
    }
  }, [router]);
  return null;
}
