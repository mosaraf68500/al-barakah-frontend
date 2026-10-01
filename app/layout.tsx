import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
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
        {/* Google Tag Manager — as high in <head> as possible */}
        <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KCL5PZDB');`}</Script>
        {/* Google tag (gtag.js) — GA4 */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-5HF48X3DP3" strategy="afterInteractive" />
        <Script id="ga4-config" strategy="afterInteractive">{`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-5HF48X3DP3');
`}</Script>
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1088474934075529');
fbq('track', 'PageView');
`}</Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1088474934075529&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* Same Google Fonts request as legacy index.html (family names are referenced literally by inline styles, so next/font's renamed families are not used). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href={FONTS_HREF} rel="stylesheet" />
      </head>
      <body className="h-full bg-[#faf9f6] text-stone-900 antialiased selection:bg-amber-900 selection:text-amber-100">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KCL5PZDB"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        <div id="root" className="min-h-full flex flex-col">
          <Providers initialData={{ products, categories, settings, reviews }}>
            <StorefrontChrome modal={modal}>{children}</StorefrontChrome>
          </Providers>
        </div>
      </body>
    </html>
  );
}
