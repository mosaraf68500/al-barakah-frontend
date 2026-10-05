import type { ReactNode } from 'react';
import { ConnectedNavbar } from '@/components/layout/ConnectedNavbar';
import { Footer } from '@/components/layout/Footer';
import { TrustBadges } from '@/components/layout/TrustBadges';
import { ToastHost } from '@/components/layout/ToastHost';
import { ChromeClientEffects } from '@/components/layout/ChromeClientEffects';
import { CheckoutHost, CompareHost, CustomerAuthHost, FloatingHosts, PolicyHost } from '@/components/layout/hosts';

/**
 * Server Component shell for the storefront chrome.
 * Interactive pieces (navbar, toasts, overlays, side-effects) stay in client leaves —
 * TrustBadges + Footer static markup stay on the server.
 */
export function StorefrontChrome({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white relative">
      <ChromeClientEffects />
      <ToastHost />
      <ConnectedNavbar />

      {children}

      <TrustBadges />
      <Footer />

      {modal}

      <CompareHost />
      <PolicyHost />
      <CheckoutHost />
      <CustomerAuthHost />
      <FloatingHosts />
    </div>
  );
}
