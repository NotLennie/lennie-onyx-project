import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const API_BASE = process.env.API_URL ?? 'http://localhost:8787';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required.' });
    }

    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      return fail(401, { error: 'Invalid email or password.' });
    }

    const setCookie = res.headers.get('Set-Cookie');
    if (setCookie) {
      const match = setCookie.match(/session=([^;]+)/);
      if (match) {
        cookies.set('session', match[1], {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
        });
      }
    }

    const { user } = await res.json() as { user: { role: string } };
    if (user.role === 'client') throw redirect(303, '/portal/dashboard');
    throw redirect(303, '/employee/dashboard');
  },
};
