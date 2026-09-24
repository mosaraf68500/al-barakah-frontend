/**
 * Browser and server fetch for `lib/api/*`. Points at the Express API (`/v1`), not the old Next seed routes.
 */
const ACCESS_KEY = 'abp_customer_access';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) sessionStorage.setItem(ACCESS_KEY, token);
    else sessionStorage.removeItem(ACCESS_KEY);
  } catch {
    /* storage unavailable */
  }
}

let refreshing: Promise<string | null> | null = null;

/** Uses the httpOnly refresh cookie set by the API. Requires `X-Abp-Client`. */
export function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!refreshing) {
    refreshing = fetch(`${API_BASE}/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Abp-Client': 'shop' },
    })
      .then(async (res) => {
        if (!res.ok) {
          setAccessToken(null);
          return null;
        }
        const body = (await res.json()) as { accessToken?: string };
        if (!body.accessToken) return null;
        setAccessToken(body.accessToken);
        return body.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  headers.set('X-Abp-Client', 'shop');
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (res.status === 401 && retry && typeof window !== 'undefined' && !path.includes('/auth/login') && !path.includes('/auth/register')) {
    const next = await refreshAccessToken();
    if (next) return apiFetch<T>(path, init, false);
  }
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    const code = typeof err.error === 'string' ? err.error : undefined;
    throw new ApiError(code || err.message || `HTTP error ${res.status}`, res.status, code);
  }
  return res.json() as Promise<T>;
}
