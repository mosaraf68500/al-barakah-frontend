'use client';

import type { ReactNode } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { ConnectedNavbar } from '@/components/layout/ConnectedNavbar';
import { Footer } from '@/components/layout/Footer';
import { TrustBadges } from '@/components/layout/TrustBadges';
import { CheckoutHost, CompareHost, CustomerAuthHost, FloatingHosts, PolicyHost } from '@/components/layout/hosts';
import { FacebookPixelProvider } from '@/components/shared/FacebookPixelProvider';
import { ImageProtection } from '@/components/shared/ImageProtection';
import { LegacyUrlRedirect } from '@/components/shared/LegacyUrlRedirect';
import { SearchUrlSync } from '@/components/shared/SearchUrlSync';
import { useOverlayHistory } from '@/hooks/useOverlayHistory';
import { useUiStore } from '@/store/uiStore';

/**
 * The shell that legacy `App.tsx` rendered around every view:
 * toast, navbar, <page>, trust bar, footer, overlays (product modal slot, compare, policy, checkout, dashboard, auth).
 */
export function StorefrontChrome({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  const toast = useUiStore((s) => s.toast);
  const toastKind = useUiStore((s) => s.toastKind);
  useOverlayHistory();

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white relative">
      <ImageProtection />
      <SearchUrlSync />
      <LegacyUrlRedirect />
      <FacebookPixelProvider />

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[80] flex items-start gap-2 max-w-sm px-4 py-3 text-white text-xs font-semibold leading-relaxed rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastKind === 'error' ? 'bg-rose-950 border border-rose-700' : 'bg-slate-900 border border-slate-800'
          }`}
        >
          {toastKind === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <span>{toast}</span>
        </div>
      )}

      {/* Main Navbar */}
      <ConnectedNavbar />

      {children}

      <TrustBadges />
      <Footer />

      {/* Product view (intercepting-route modal slot) */}
      {modal}

      <CompareHost />
      <PolicyHost />
      <CheckoutHost />
      <CustomerAuthHost />
      <FloatingHosts />
    </div>
  );
}
