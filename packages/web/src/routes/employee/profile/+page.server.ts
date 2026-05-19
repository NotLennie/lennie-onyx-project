import type { PageServerLoad } from './$types';
import type { Employee } from '@project/shared';

export const load: PageServerLoad = async ({ fetch, platform }) => {
  const API_BASE = platform?.env?.API_URL ?? 'http://localhost:8787';
  try {
    const res = await fetch(`${API_BASE}/api/employee/profile`);
    if (!res.ok) return { profile: null as Employee | null };
    const data = await res.json() as { user: Employee };
    return { profile: data.user };
  } catch {
    return { profile: null as Employee | null };
  }
};
