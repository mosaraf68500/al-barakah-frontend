'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AuthAdapter } from '@/lib/auth/AuthAdapter';
import { jwtAdapter, restoreCustomerSession } from '@/lib/auth/jwtAdapter';
import type { AuthContextValue, AuthProfile, AuthUser } from '@/types/auth';
import { notify } from '@/lib/ui/notify';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * The single auth abstraction the UI depends on. The default adapter is the real phone + PIN JWT API.
 */
export function AuthProvider({ children, adapter = jwtAdapter }: { children: ReactNode; adapter?: AuthAdapter }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [sessionConflictMsg, setSessionConflictMsg] = useState<string | null>(null);
  const sessionGen = useRef(0);

  useEffect(() => {
    let alive = true;
    const start = sessionGen.current;
    const cached = adapter.restoreSession();
    if (cached) {
      setUser(cached.user);
      setProfile(cached.profile);
    }
    const finish = adapter === jwtAdapter ? restoreCustomerSession() : Promise.resolve(cached);
    finish
      .then((s) => {
        if (!alive || sessionGen.current !== start) return;
        setUser(s?.user ?? null);
        setProfile(s?.profile ?? null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [adapter]);

  const apply = useCallback((s: { user: AuthUser; profile: AuthProfile }) => {
    sessionGen.current += 1;
    setUser(s.user);
    setProfile(s.profile);
    setIsAuthModalOpen(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const signOut = async () => {
      await adapter.signOut();
      setUser(null);
      setProfile(null);
      notify('লগআউট হয়েছে।');
    };
    return {
      user,
      profile,
      loading,
      isAuthModalOpen,
      sessionConflictMsg,
      openAuthModal: () => setIsAuthModalOpen(true),
      closeAuthModal: () => setIsAuthModalOpen(false),
      clearSessionConflict: () => setSessionConflictMsg(null),
      signInWithGoogle: async (idToken: string) => {
        setSessionConflictMsg(null);
        try {
          apply(await adapter.signInWithGoogle(idToken));
          notify('গুগল দিয়ে লগইন হয়েছে।');
        } catch (err) {
          notify(err instanceof Error ? err.message : 'গুগল লগইন হয়নি।', 'error');
        }
      },
      registerWithPhoneAndPassword: async (phone, name, pin, address) => {
        setSessionConflictMsg(null);
        apply(await adapter.register(phone, name, pin, address));
      },
      loginWithPhoneAndPassword: async (phone, pin) => {
        setSessionConflictMsg(null);
        apply(await adapter.login(phone, pin));
      },
      signOut,
      logout: signOut,
      refreshProfile: async () => {
        const s = await restoreCustomerSession();
        if (s) {
          setUser(s.user);
          setProfile(s.profile);
        }
      },
    };
  }, [adapter, apply, user, profile, loading, isAuthModalOpen, sessionConflictMsg]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
