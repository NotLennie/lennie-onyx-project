import type { PageServerLoad } from './$types';
import type { Service, Role } from '@project/shared';

export const load: PageServerLoad = async ({ fetch, platform, locals }) => {
  const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
  const isAdmin = locals.user?.role === 'admin';
  try {
    const [svcRes, rolesRes] = await Promise.all([
      fetch(`${API_BASE}/api/${isAdmin ? 'admin' : 'employee'}/services`),
      fetch(`${API_BASE}/api/${isAdmin ? 'admin' : 'employee'}/roles`),
    ]);

    const services: Service[] = svcRes.ok ? (await svcRes.json() as { services: Service[] }).services : [];
    const roles: Role[] = rolesRes.ok ? (await rolesRes.json() as { roles: Role[] }).roles : [];

    return { services, roles, isAdmin };
  } catch {
    return { services: [] as Service[], roles: [] as Role[], isAdmin };
  }
};
