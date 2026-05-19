import type { PageServerLoad } from './$types';
import type { PtoRequest } from '@project/shared';

export const load: PageServerLoad = async ({ fetch, platform }) => {
  const API_BASE = platform?.env?.API_URL ?? 'http://localhost:8787';
  try {
    const res = await fetch(`${API_BASE}/api/employee/pto`);
    if (!res.ok) return { pto: [] as PtoRequest[] };
    const data = await res.json() as { pto: PtoRequest[] };
    return { pto: data.pto };
  } catch {
    return { pto: [] as PtoRequest[] };
  }
};
