import { ApiError, apiFetch, getAccessToken, refreshAccessToken, setAccessToken, setRefreshToken } from '@/lib/api/http';
import type { AuthSession } from '@/types/auth';
import { isStrongPassword } from '@/lib/validation/password';
import { formatBdMobile, isValidBdMobile } from '@/lib/validation/phone';
import type { AuthAdapter } from './AuthAdapter';

const PROFILE_KEY = 'abp_customer_profile';

interface ApiUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string;
  avatarUrl?: string;
  role: 'customer';
}

function toSession(user: ApiUser): AuthSession {
  const email = user.email || '';
  return {
    user: { uid: user.id, email: email || null, displayName: user.name, photoURL: user.avatarUrl || null },
    profile: { id: user.id, email, name: user.name, avatarUrl: user.avatarUrl, phone: user.phone, role: 'customer' },
  };
}

function remember(session: AuthSession) {
  try {
    sessionStorage.setItem(PROFILE_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable */
  }
}

function remembered(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    return session?.profile?.id ? session : null;
  } catch {
    return null;
  }
}

function forget() {
  setAccessToken(null);
  setRefreshToken(null);
  try {
    sessionStorage.removeItem(PROFILE_KEY);
  } catch {
    /* ignore */
  }
}

async function authError(err: unknown): Promise<never> {
  if (err instanceof ApiError) {
    if (err.code === 'INVALID_CREDENTIALS') throw new Error('WRONG_PIN');
    if (err.code === 'ACCOUNT_ALREADY_EXISTS') throw new Error('ACCOUNT_ALREADY_EXISTS');
    if (err.code === 'INVALID_BD_PHONE') throw new Error('INVALID_BD_PHONE');
    if (err.code === 'PIN_TOO_SHORT' || err.code === 'PIN_REQUIRED' || err.code === 'PIN_INVALID') throw new Error(err.code);
    if (err.code === 'ACCOUNT_LOCKED' || err.code === 'TOO_MANY_REQUESTS') throw new Error('অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।');
  }
  throw err;
}

export const jwtAdapter: AuthAdapter = {
  restoreSession() {
    return remembered();
  },

  async signInWithGoogle() {
    throw new Error('Google সাইন-ইন নেই। ফোন নম্বর ও পিন দিয়ে লগইন করুন।');
  },

  async register(phone, name, pin, address) {
    const cleanPhone = formatBdMobile(phone);
    if (!isValidBdMobile(cleanPhone)) throw new Error('INVALID_BD_PHONE');
    if (!isStrongPassword(pin)) throw new Error('PIN_INVALID');
    try {
      const res = await apiFetch<{ accessToken: string; refreshToken?: string; user: ApiUser }>('/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ phone: cleanPhone, name: name.trim(), pin: pin.trim(), ...(address?.trim() ? { address: address.trim() } : {}) }),
      });
      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken ?? null);
      const session = toSession(res.user);
      remember(session);
      return session;
    } catch (err) {
      return authError(err);
    }
  },

  async login(phone, pin) {
    const cleanPhone = formatBdMobile(phone);
    if (!isValidBdMobile(cleanPhone)) throw new Error('INVALID_BD_PHONE');
    if (!pin.trim()) throw new Error('PIN_REQUIRED');
    try {
      const res = await apiFetch<{ accessToken: string; refreshToken?: string; user: ApiUser }>('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone: cleanPhone, pin: pin.trim() }),
      });
      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken ?? null);
      const session = toSession(res.user);
      remember(session);
      return session;
    } catch (err) {
      return authError(err);
    }
  },

  async signOut() {
    try {
      await apiFetch('/v1/auth/logout', { method: 'POST' });
    } catch {
      /* session may already be gone */
    }
    forget();
  },

  getAuthHeaders(): Record<string, string> {
    const token = getAccessToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  },
};

/** Warm the access token from the stored refresh token when the tab still has a profile but the access token was dropped. */
export async function restoreCustomerSession(): Promise<AuthSession | null> {
  if (!getAccessToken()) {
    const token = await refreshAccessToken();
    if (!token) {
      forget();
      return null;
    }
  }
  try {
    const res = await apiFetch<{ user: ApiUser }>('/v1/auth/me');
    const session = toSession(res.user);
    remember(session);
    return session;
  } catch {
    forget();
    return null;
  }
}
