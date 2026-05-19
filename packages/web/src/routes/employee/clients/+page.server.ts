import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ClientRow } from '$lib/api';

export const load: PageServerLoad = async ({ fetch, platform, locals }) => {
  if (locals.user?.role !== 'admin') throw redirect(303, '/employee/dashboard');

  const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
  try {
    const res = await fetch(`${API_BASE}/api/admin/clients`);
    if (!res.ok) return { clients: [] as ClientRow[] };
    const data = await res.json() as { clients: ClientRow[] };
    return { clients: data.clients };
  } catch {
    return { clients: [] as ClientRow[] };
  }
};
