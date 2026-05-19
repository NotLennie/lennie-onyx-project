import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ cookies, platform }) => {
    const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
    const session = cookies.get('session');

    if (session) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { Cookie: `session=${session}` },
      }).catch(() => {});
    }

    cookies.delete('session', { path: '/', secure: true, sameSite: 'lax', httpOnly: true });
    throw redirect(303, '/login');
  },
};
