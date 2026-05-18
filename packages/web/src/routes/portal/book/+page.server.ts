import type { PageServerLoad } from './$types';
import type { Service } from '@project/shared';

export const load: PageServerLoad = async ({ fetch, platform }) => {
  const API_BASE = platform?.env?.API_URL ?? 'http://localhost:8787';
  try {
    const res = await fetch(`${API_BASE}/api/public/services`);
    if (!res.ok) return { services: [] as Service[] };
    const data = await res.json() as { services: Service[] };
    return { services: data.services };
  } catch {
    return { services: [] as Service[] };
  }
};
