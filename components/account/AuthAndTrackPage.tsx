'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AuthAndTrackView } from '@/components/account/AuthAndTrackView';

/** `/login` and `/track` (?code= pre-fills and runs the lookup). */
export function AuthAndTrackPage({ initialTab }: { initialTab: 'LOGIN' | 'TRACK' }) {
  const router = useRouter();
  const code = useSearchParams().get('code') ?? undefined;
  return (
    <AuthAndTrackView
      initialTab={initialTab}
      initialTrackingCode={code}
      onClose={() => router.push('/')}
      orders={[]}
      currency="BDT"
      onOpenDashboard={() => router.push('/account')}
    />
  );
}
