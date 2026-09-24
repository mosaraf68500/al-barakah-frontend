import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { StorefrontChrome } from '@/components/layout/StorefrontChrome';
import { getCategories, getProducts, getReviews, getSettings } from '@/lib/api';
import { homeMetadata, SITE_URL } from '@/lib/seo/metadata';
import { Providers } from '@/providers/Providers';

// Data changes when orders/reviews are written (TEMP local store) - never cache the shell statically.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const code = settings.facebookPixelConfig.domainVerificationCode?.trim();
  return {
    metadataBase: new URL(SITE_URL),
    ...homeMetadata(settings),
    title: { default: settings.seoConfig.metaTitle, template: '%s' },
    other: code ? { 'facebook-domain-verification': (code.match(/content=["']([^"']+)["']/i)?.[1] ?? code.replace(/[<>"'=]/g, '').trim()) } : undefined,
  };
}

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Rubik:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap';

export default async function RootLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  const [products, categories, settings, reviews] = await Promise.all([getProducts(), getCategories(), getSettings(), getReviews()]);

  return (
    <html lang="en" className="h-full">
      <head>
        {/* Same Google Fonts request as legacy index.html (family names are referenced literally by inline styles, so next/font's renamed families are not used). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href={FONTS_HREF} rel="stylesheet" />
      </head>
      <body className="h-full bg-[#faf9f6] text-stone-900 antialiased selection:bg-amber-900 selection:text-amber-100">
        <div id="root" className="min-h-full flex flex-col">
          <Providers initialData={{ products, categories, settings, reviews }}>
            <StorefrontChrome modal={modal}>{children}</StorefrontChrome>
          </Providers>
        </div>
      </body>
    </html>
  );
}
