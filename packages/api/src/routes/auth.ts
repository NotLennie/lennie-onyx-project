import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, signupSchema } from '@project/shared';
import type { Env } from '../types';
import { AuthService } from '../auth/service';
import { requireAuth } from '../auth/middleware';
import { setSessionCookie, clearSessionCookie, getSessionCookie } from '../auth/cookies';
import { clients, employees } from '../db/schema';
import { eq } from 'drizzle-orm';

export const authRoutes = new Hono<Env>();

authRoutes.post('/signup', zValidator('json', signupSchema), async (c) => {
  const input = c.req.valid('json');
  const svc = new AuthService(c.get('db'), c.env.USER_SESSIONS);

  try {
    const { user, token } = await svc.signupClient(input);
    return c.json({ user }, 201, {
      'Set-Cookie': setSessionCookie(token),
    });
  } catch (err: any) {
    if (err.message === 'EMAIL_EXISTS') {
      return c.json({ error: 'An account with this email already exists. Please log in instead.' }, 409);
    }
    return c.json({ error: 'Signup failed' }, 500);
  }
});

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const input = c.req.valid('json');
  const svc = new AuthService(c.get('db'), c.env.USER_SESSIONS);

  try {
    const { user, token } = await svc.login(input);
    return c.json({ user }, 200, {
      'Set-Cookie': setSessionCookie(token),
    });
  } catch {
    return c.json({ error: 'Invalid email or password' }, 401);
  }
});

authRoutes.post('/logout', async (c) => {
  const cookie = getSessionCookie(c.req.header('Cookie') ?? null);
  if (cookie) {
    const svc = new AuthService(c.get('db'), c.env.USER_SESSIONS);
    await svc.logout(cookie);
  }
  return c.json({ ok: true }, 200, {
    'Set-Cookie': clearSessionCookie(),
  });
});

authRoutes.get('/me', requireAuth, async (c) => {
  const userId = c.get('userId');
  const role = c.get('userRole');
  const db = c.get('db');

  if (role === 'client') {
    const [client] = await db.select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      profilePictureUrl: clients.profilePictureUrl,
    }).from(clients).where(eq(clients.id, userId)).limit(1);
    return c.json({ user: { ...client, role } });
  }

  const [employee] = await db.select({
    id: employees.id,
    name: employees.name,
    email: employees.email,
    profilePictureUrl: employees.profilePictureUrl,
    isAdmin: employees.isAdmin,
  }).from(employees).where(eq(employees.id, userId)).limit(1);
  return c.json({ user: { ...employee, role } });
});
