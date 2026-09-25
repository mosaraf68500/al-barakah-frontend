import { formatBdMobile, isValidBdMobile } from '@/lib/validation/phone';
import type { AuthSession } from '@/types/auth';
import type { AuthAdapter } from './AuthAdapter';

/**
 * TEMP: Phase 1 stub, replaced by real JWT auth in Phase 3.
 *
 * NOTHING here verifies a credential. Legacy customer accounts (Firebase Google + Firestore `customer_accounts`
 * with plaintext PINs) were deliberately NOT exported, so there is no credential store to check against.
 * The login screens behave exactly as before (same fields, validation messages, success flow) but any well-formed
 * input "signs in" a local mock user. Because of that, ACCOUNT_NOT_FOUND / WRONG_PIN / ACCOUNT_ALREADY_EXISTS
 * can never occur in Phase 1.
 */

// Same localStorage keys as legacy so the customer dashboard (addresses/profile) keeps working.
const USER_KEY = 'albarakah_customer_user';
const SESSION_KEY = 'albarakah_active_session_id';
const ADDRESSES_KEY = 'albarakah_user_addresses';

const avatar = (name: string) => `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

function persist(session: AuthSession) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(session.profile));
    localStorage.setItem(SESSION_KEY, `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  } catch {
    /* storage unavailable */
  }
}

function phoneSession(cleanPhone: string, name: string): AuthSession {
  const email = `phone_${cleanPhone}@customer.albarakah.store`; // same synthetic e-mail rule as legacy
  const displayName = name.trim() || `Customer ${cleanPhone.slice(-4)}`;
  return {
    user: { uid: `phone_${cleanPhone}`, email, displayName, photoURL: avatar(displayName) },
    profile: { id: `phone_${cleanPhone}`, email, name: displayName, avatarUrl: avatar(displayName), phone: cleanPhone, role: 'customer' },
  };
}

function saveAddress(cleanPhone: string, name: string, address: string) {
  try {
    const saved = JSON.parse(localStorage.getItem(ADDRESSES_KEY) || '[]');
    const entry = { id: `addr_${Date.now()}`, name, phone: cleanPhone, address, district: 'Dhaka', isDefault: true };
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify([entry, ...saved.map((a: any) => ({ ...a, isDefault: false }))]));
  } catch {
    /* ignore */
  }
}

export const stubAdapter: AuthAdapter = {
  restoreSession() {
    // TEMP: Phase 1 stub, replaced by real JWT auth in Phase 3.
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!p?.email) return null;
      const name = p.name || p.displayName || String(p.email).split('@')[0];
      return {
        user: { uid: p.uid || p.id || `local_${Date.now()}`, email: p.email, displayName: name, photoURL: p.photoURL || p.avatarUrl || null },
        // Role is always 'customer' here: legacy trusted a client-editable role/hardcoded emails (SECURITY_RISKS.md #10).
        profile: { id: p.id || p.uid || `profile_${Date.now()}`, email: p.email, name, avatarUrl: p.avatarUrl || p.photoURL, phone: p.phone, role: 'customer' },
      };
    } catch {
      return null;
    }
  },

  async signInWithGoogle(_idToken: string) {
    // TEMP: Phase 1 stub, replaced by real JWT auth in Phase 3. No Google OAuth happens; a sample customer is used.
    const name = 'Demo Customer';
    const email = 'demo.customer@example.com';
    const session: AuthSession = {
      user: { uid: 'stub_google_customer', email, displayName: name, photoURL: avatar(name) },
      profile: { id: 'stub_google_customer', email, name, avatarUrl: avatar(name), role: 'customer' },
    };
    persist(session);
    return session;
  },

  async register(phone, name, pin, address) {
    // TEMP: Phase 1 stub, replaced by real JWT auth in Phase 3. Validates input like legacy, stores nothing.
    const cleanPhone = formatBdMobile(phone);
    if (!isValidBdMobile(cleanPhone)) throw new Error('INVALID_BD_PHONE');
    if (!pin || pin.trim().length < 4) throw new Error('PIN_TOO_SHORT');
    const session = phoneSession(cleanPhone, name);
    if (address?.trim()) saveAddress(cleanPhone, session.profile.name, address.trim());
    persist(session);
    return session;
  },

  async login(phone, pin) {
    // TEMP: Phase 1 stub, replaced by real JWT auth in Phase 3. The PIN is NOT checked.
    const cleanPhone = formatBdMobile(phone);
    if (!isValidBdMobile(cleanPhone)) throw new Error('INVALID_BD_PHONE');
    if (!pin || !pin.trim()) throw new Error('PIN_REQUIRED');
    const session = phoneSession(cleanPhone, '');
    persist(session);
    return session;
  },

  async signOut() {
    // TEMP: Phase 1 stub, replaced by real JWT auth in Phase 3.
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  },

  getAuthHeaders() {
    // TEMP: Phase 1 stub, replaced by real JWT auth in Phase 3 (Authorization: Bearer <accessToken>).
    return {};
  },
};
