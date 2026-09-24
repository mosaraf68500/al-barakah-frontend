import type { AuthSession } from '@/types/auth';

/**
 * What the AuthProvider needs from an auth back-end. UI never talks to an adapter directly - only via `useAuth()` -
 * so Phase 3 swaps `stubAdapter` for a JWT adapter (POST /auth/register|login|refresh|logout) without touching components.
 */
export interface AuthAdapter {
  /** Restore a previous session on page load (or null). */
  restoreSession(): AuthSession | null;
  signInWithGoogle(): Promise<AuthSession>;
  register(phone: string, name: string, pin: string, address?: string): Promise<AuthSession>;
  login(phone: string, pin: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  /** Auth header(s) for authenticated `lib/api` calls. Empty in Phase 1. */
  getAuthHeaders(): Record<string, string>;
}
