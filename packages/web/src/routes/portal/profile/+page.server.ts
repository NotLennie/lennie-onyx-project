import type { PageServerLoad } from './$types';
import type { Client } from '@project/shared';

export const load: PageServerLoad = async ({ fetch, platform }) => {
  const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
  try {
    const res = await fetch(`${API_BASE}/api/client/profile`);
    if (!res.ok) return { profile: null as Client | null };
    const data = await res.json() as { user: Client };
    return { profile: data.user };
  } catch {
    return { profile: null as Client | null };
  }
};
