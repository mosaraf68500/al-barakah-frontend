export type UserRole = 'customer' | 'admin' | 'super_admin';

/** Same shape as legacy `AuthUser` so consuming components need no changes. */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

/** Same shape as legacy `UserProfile`. `phone` is read by the customer dashboard. */
export interface AuthProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  role: UserRole;
}

/** Exact Error.message strings the legacy login/registration UI switches on. */
export type AuthErrorCode =
  | 'INVALID_BD_PHONE'
  | 'PIN_TOO_SHORT'
  | 'PIN_REQUIRED'
  | 'ACCOUNT_ALREADY_EXISTS'
  | 'ACCOUNT_NOT_FOUND'
  | 'WRONG_PIN';

export interface AuthSession {
  user: AuthUser;
  profile: AuthProfile;
}

export interface AuthContextValue {
  user: AuthUser | null;
  profile: AuthProfile | null;
  loading: boolean;

  isAuthModalOpen: boolean;
  sessionConflictMsg: string | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  clearSessionConflict: () => void;

  signInWithGoogle: () => Promise<void>;
  registerWithPhoneAndPassword: (phone: string, name: string, pin: string, address?: string) => Promise<void>;
  loginWithPhoneAndPassword: (phone: string, pin: string) => Promise<void>;

  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  /** Reload the signed-in profile from the API (after a name change). */
  refreshProfile: () => Promise<void>;
}
