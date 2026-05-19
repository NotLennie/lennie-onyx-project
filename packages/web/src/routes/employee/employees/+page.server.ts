import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Employee, Role } from '@project/shared';

export const load: PageServerLoad = async ({ fetch, platform, locals }) => {
  if (locals.user?.role !== 'admin') throw redirect(303, '/employee/dashboard');

  const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
  try {
    const [empRes, rolesRes] = await Promise.all([
      fetch(`${API_BASE}/api/admin/employees`),
      fetch(`${API_BASE}/api/admin/roles`),
    ]);

    const employees: Employee[] = empRes.ok ? ((await empRes.json() as { employees: Employee[] }).employees) : [];
    const roles: Role[] = rolesRes.ok ? ((await rolesRes.json() as { roles: Role[] }).roles) : [];

    return { employees, roles };
  } catch {
    return { employees: [] as Employee[], roles: [] as Role[] };
  }
};
