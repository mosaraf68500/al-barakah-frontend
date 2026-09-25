/**
 * Browser and server fetch for `lib/api/*`. Points at the Express API (`/v1`), not the old Next seed routes.
 * The access token and the refresh token both live in sessionStorage. Refresh sends `X-Abp-Refresh`
 * because the API host (vercel.app) cannot set a reliable cookie for albarakahpremium.com.
 * `credentials: 'include'` stays so a browser that still has the old httpOnly cookie can refresh
 * when sessionStorage has no refresh token yet.
 */
const ACCESS_KEY = 'abp_customer_access';
const REFRESH_KEY = 'abp_customer_refresh';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) sessionStorage.setItem(key, token);
    else sessionStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

export function getAccessToken(): string | null {
  return readStorage(ACCESS_KEY);
}

export function setAccessToken(token: string | null) {
  writeStorage(ACCESS_KEY, token);
}

export function getRefreshToken(): string | null {
  return readStorage(REFRESH_KEY);
}

export function setRefreshToken(token: string | null) {
  writeStorage(REFRESH_KEY, token);
}

let refreshing: Promise<string | null> | null = null;

/** Sends the sessionStorage refresh token. The cookie, if the browser still has one, is only a fallback. */
export function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!refreshing) {
    const refreshToken = getRefreshToken();
    refreshing = fetch(`${API_BASE}/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Abp-Client': 'shop',
        ...(refreshToken ? { 'X-Abp-Refresh': refreshToken } : {}),
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          setAccessToken(null);
          setRefreshToken(null);
          return null;
        }
        const body = (await res.json()) as { accessToken?: string; refreshToken?: string };
        if (!body.accessToken) return null;
        setAccessToken(body.accessToken);
        if (body.refreshToken) setRefreshToken(body.refreshToken);
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
  if ((path.includes('/auth/logout') || path.includes('/auth/change-pin')) && !headers.has('X-Abp-Refresh')) {
    const refreshToken = getRefreshToken();
    if (refreshToken) headers.set('X-Abp-Refresh', refreshToken);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (res.status === 401 && retry && typeof window !== 'undefined' && !path.includes('/auth/login') && !path.includes('/auth/register') && !path.includes('/auth/refresh')) {
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
