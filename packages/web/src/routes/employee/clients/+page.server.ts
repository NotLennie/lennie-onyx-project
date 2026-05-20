import type { PageServerLoad } from './$types';
import type { ClientRow } from '$lib/api';

export const load: PageServerLoad = async ({ fetch, platform }) => {
  const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
  try {
    const res = await fetch(`${API_BASE}/api/employee/clients`);
    if (!res.ok) return { clients: [] as ClientRow[] };
    const data = await res.json() as { clients: ClientRow[] };
    return { clients: data.clients };
  } catch {
    return { clients: [] as ClientRow[] };
  }
};
