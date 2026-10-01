'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthAndTrackView } from '@/components/account/AuthAndTrackView';
import { CHECKOUT_PATH, CHECKOUT_SIGN_IN_MESSAGE, safeReturnTo } from '@/lib/auth/returnTo';
import { useAuth } from '@/providers/AuthProvider';

/** `/login` and `/track` (?code= pre-fills and runs the lookup). */
export function AuthAndTrackPage({ initialTab }: { initialTab: 'LOGIN' | 'TRACK' }) {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get('code') ?? undefined;
  const returnTo = safeReturnTo(params.get('returnTo'));
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user || initialTab !== 'LOGIN') return;
    router.replace(returnTo || '/account');
  }, [loading, user, returnTo, router, initialTab]);

  return (
    <AuthAndTrackView
      initialTab={initialTab}
      initialTrackingCode={code}
      onClose={() => router.push('/')}
      orders={[]}
      currency="BDT"
      notice={returnTo === CHECKOUT_PATH ? CHECKOUT_SIGN_IN_MESSAGE : undefined}
      onOpenDashboard={() => router.push(returnTo || '/account')}
    />
  );
}
