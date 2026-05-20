import type { PageServerLoad } from './$types';
import type { Employee, Role } from '@project/shared';

export const load: PageServerLoad = async ({ fetch, platform, locals }) => {
  const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
  const isAdmin = locals.user?.role === 'admin';
  try {
    const [empRes, rolesRes] = await Promise.all([
      fetch(`${API_BASE}/api/${isAdmin ? 'admin' : 'employee'}/employees`),
      fetch(`${API_BASE}/api/${isAdmin ? 'admin' : 'employee'}/roles`),
    ]);

    const employees: Employee[] = empRes.ok ? (await empRes.json() as { employees: Employee[] }).employees : [];
    const roles: Role[] = rolesRes.ok ? (await rolesRes.json() as { roles: Role[] }).roles : [];

    return { employees, roles, isAdmin };
  } catch {
    return { employees: [] as Employee[], roles: [] as Role[], isAdmin };
  }
};
