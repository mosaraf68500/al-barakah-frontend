'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

function useFooterNav() {
  const router = useRouter();
  const setPolicyOpen = useUiStore((s) => s.setPolicyOpen);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);
  const goHome = () => {
    setSearchQuery('');
    router.push('/');
  };
  return { router, setPolicyOpen, goHome };
}

/** Quick-links column only. */
export function FooterQuickLinks() {
  const { router, setPolicyOpen, goHome } = useFooterNav();
  const linkClass = 'flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors';

  return (
    <ul className="space-y-1.5 text-stone-300">
      <li>
        <button
          type="button"
          onClick={() => {
            goHome();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={linkClass}
        >
          <ArrowRight className="w-3 h-3 text-amber-500/80" />
          <span>Home</span>
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => {
            goHome();
            setTimeout(() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }), 50);
          }}
          className={linkClass}
        >
          <ArrowRight className="w-3 h-3 text-amber-500/80" />
          <span>Shop All Products</span>
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' })}
          className={linkClass}
        >
          <ArrowRight className="w-3 h-3 text-amber-500/80" />
          <span>About Us</span>
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' })}
          className={linkClass}
        >
          <ArrowRight className="w-3 h-3 text-amber-500/80" />
          <span>Contact Us</span>
        </button>
      </li>
      <li>
        <button type="button" onClick={() => setPolicyOpen(true)} className={linkClass}>
          <ArrowRight className="w-3 h-3 text-amber-500/80" />
          <span>Privacy & Return Policy</span>
        </button>
      </li>
      <li>
        <button type="button" onClick={() => setPolicyOpen(true)} className={linkClass}>
          <ArrowRight className="w-3 h-3 text-amber-500/80" />
          <span>Terms & Conditions</span>
        </button>
      </li>
      <li>
        <button type="button" onClick={() => router.push('/track')} className={linkClass}>
          <ArrowRight className="w-3 h-3 text-amber-500/80" />
          <span>Track Order</span>
        </button>
      </li>
    </ul>
  );
}

/** Bottom legal row only. */
export function FooterLegalLinks() {
  const { setPolicyOpen } = useFooterNav();
  const bottomClass = 'hover:text-amber-400 cursor-pointer transition-colors';
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-stone-300">
      <button type="button" onClick={() => setPolicyOpen(true)} className={bottomClass}>
        Privacy Policy
      </button>
      <span className="text-stone-700">|</span>
      <button type="button" onClick={() => setPolicyOpen(true)} className={bottomClass}>
        Return Policy
      </button>
      <span className="text-stone-700">|</span>
      <button type="button" onClick={() => setPolicyOpen(true)} className={bottomClass}>
        Terms & Conditions
      </button>
    </div>
  );
}
