import type { StoreSettings } from '@/types';
import { apiFetch } from './http';

/** Public store settings. Secrets are not in this response. */
export async function getSettings(): Promise<StoreSettings> {
  return apiFetch<StoreSettings>('/v1/settings/public');
}
