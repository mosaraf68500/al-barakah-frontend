/** Shown when a guest tries to place an order. */
export const CHECKOUT_SIGN_IN_MESSAGE = 'Please sign in to complete your order';

export const CHECKOUT_PATH = '/checkout';

/**
 * A same-site path to return to after login. Rejects protocol-relative and off-site values.
 */
export function safeReturnTo(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\') || raw.includes('://')) return null;
  const path = raw.split('#')[0];
  if (path.startsWith('/login') || path.startsWith('/track')) return null;
  return path;
}
