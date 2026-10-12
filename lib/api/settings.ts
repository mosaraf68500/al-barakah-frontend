import type { StoreSettings } from '@/types';
import { apiFetch } from './http';

/** Public store settings. Secrets are not in this response. Short TTL so admin delivery/payment toggles appear quickly. */
export async function getSettings(): Promise<StoreSettings> {
  return apiFetch<StoreSettings>('/v1/settings/public', { next: { revalidate: 5 } } as RequestInit);
}
