import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const API_BASE = event.platform?.env?.API_URL ?? 'http://localhost:8787';
  const cookie = event.cookies.get('session');

  if (cookie) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Cookie: `session=${cookie}` },
      });
      if (res.ok) {
        const data = await res.json() as { user: App.Locals['user'] };
        event.locals.user = data.user;
      } else {
        event.locals.user = null;
      }
    } catch {
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};
