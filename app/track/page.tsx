import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthAndTrackPage } from '@/components/account/AuthAndTrackPage';
import { getSettings } from '@/lib/api';
import { staticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata('track', await getSettings());
}

export default function Page() {
  return <Suspense><AuthAndTrackPage initialTab="TRACK" /></Suspense>;
}
