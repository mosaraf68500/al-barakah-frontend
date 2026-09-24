import { apiFetch } from './http';

export interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  isDefault: boolean;
}

export interface ProfileUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string;
  avatarUrl?: string;
  role: 'customer';
}

interface AddressBody {
  name: string;
  phone: string;
  address: string;
  district: string;
  isDefault: boolean;
}

function asAddresses(raw: unknown): SavedAddress[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const a = item as Partial<SavedAddress>;
    return {
      id: String(a.id ?? ''),
      name: String(a.name ?? ''),
      phone: String(a.phone ?? ''),
      address: String(a.address ?? ''),
      district: String(a.district ?? ''),
      isDefault: Boolean(a.isDefault),
    };
  }).filter((a) => a.id);
}

/** `PATCH /v1/auth/me` — name only. Phone is the login identity and is not accepted. */
export async function updateMyProfile(name: string): Promise<ProfileUser> {
  const res = await apiFetch<{ user: ProfileUser }>('/v1/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ name: name.trim() }),
  });
  return res.user;
}

export async function listMyAddresses(): Promise<SavedAddress[]> {
  return asAddresses(await apiFetch<unknown>('/v1/auth/addresses'));
}

export async function createMyAddress(body: AddressBody): Promise<SavedAddress[]> {
  return asAddresses(await apiFetch<unknown>('/v1/auth/addresses', { method: 'POST', body: JSON.stringify(body) }));
}

export async function updateMyAddress(id: string, body: Partial<AddressBody>): Promise<SavedAddress[]> {
  return asAddresses(await apiFetch<unknown>(`/v1/auth/addresses/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) }));
}

export async function deleteMyAddress(id: string): Promise<SavedAddress[]> {
  return asAddresses(await apiFetch<unknown>(`/v1/auth/addresses/${encodeURIComponent(id)}`, { method: 'DELETE' }));
}
