import type { PageServerLoad } from './$types';
import type { PtoRequest } from '@project/shared';

export const load: PageServerLoad = async ({ fetch, platform, locals }) => {
  const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
  const isAdmin = locals.user?.role === 'admin';
  const userId = locals.user?.id ?? '';
  try {
    const res = await fetch(`${API_BASE}/api/employee/pto`);
    if (!res.ok) return { pto: [] as PtoRequest[], isAdmin, userId };
    const data = await res.json() as { pto: PtoRequest[] };
    return { pto: data.pto, isAdmin, userId };
  } catch {
    return { pto: [] as PtoRequest[], isAdmin, userId };
  }
};
