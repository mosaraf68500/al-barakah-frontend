import { NextResponse, type NextRequest } from 'next/server';

/**
 * Legacy URL redirects (decision 4). Legacy links used query strings on `/`:
 *   ?landing= | ?ad= | ?fb=      -> /product/<value>
 *   ?verify=  | ?product=        -> /product/<value>?verified=1   (QR-code "authentic product" scans)
 *   ?admin=true                  -> admin app (NEXT_PUBLIC_ADMIN_URL) or home; the admin UI is not part of this repo
 * Hash-based legacy links (#product-…, #landing-…, #admin) are handled client-side (LegacyUrlRedirect).
 */
export function middleware(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const landing = searchParams.get('landing') || searchParams.get('ad') || searchParams.get('fb');
  if (landing) {
    return NextResponse.redirect(new URL(`/product/${encodeURIComponent(landing)}`, req.url), 308);
  }

  const verify = searchParams.get('verify') || searchParams.get('product');
  if (verify) {
    return NextResponse.redirect(new URL(`/product/${encodeURIComponent(verify)}?verified=1`, req.url), 308);
  }

  if (searchParams.get('admin') === 'true') {
    const admin = process.env.NEXT_PUBLIC_ADMIN_URL;
    return NextResponse.redirect(admin ? admin : new URL('/', req.url), 307);
  }

  return NextResponse.next();
}

export const config = { matcher: ['/'] };
