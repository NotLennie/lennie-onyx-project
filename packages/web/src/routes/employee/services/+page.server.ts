import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Service, Role } from '@project/shared';

export const load: PageServerLoad = async ({ fetch, platform, locals }) => {
  if (locals.user?.role !== 'admin') throw redirect(303, '/employee/dashboard');

  const API_BASE = platform?.env?.API_URL ?? 'http://localhost:8787';
  try {
    const [svcRes, rolesRes] = await Promise.all([
      fetch(`${API_BASE}/api/admin/services`),
      fetch(`${API_BASE}/api/admin/roles`),
    ]);

    const services: Service[] = svcRes.ok ? ((await svcRes.json() as { services: Service[] }).services) : [];
    const roles: Role[] = rolesRes.ok ? ((await rolesRes.json() as { roles: Role[] }).roles) : [];

    return { services, roles };
  } catch {
    return { services: [] as Service[], roles: [] as Role[] };
  }
};
