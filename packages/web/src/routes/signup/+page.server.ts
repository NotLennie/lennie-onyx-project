import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies, platform }) => {
    const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';

    const form = await request.formData();
    const name = form.get('name') as string;
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    if (!name || !email || !password) {
      return fail(400, { error: 'All fields are required.' });
    }
    if (password.length < 8) {
      return fail(400, { error: 'Password must be at least 8 characters.' });
    }

    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.status === 409) {
      return fail(409, { error: 'An account with this email already exists. Please log in instead.' });
    }
    if (!res.ok) {
      return fail(500, { error: 'Signup failed. Please try again.' });
    }

    const setCookie = res.headers.get('Set-Cookie');
    const match = setCookie?.match(/session=([^;]+)/);
    if (!match) {
      return fail(500, { error: 'Signup failed. Please try again.' });
    }

    cookies.set('session', match[1], {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 24 * 7,
    });

    throw redirect(303, '/portal/dashboard');
  },
};
