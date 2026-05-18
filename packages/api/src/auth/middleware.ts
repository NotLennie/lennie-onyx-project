import type { MiddlewareHandler } from 'hono';
import type { Env } from '../types';
import { AuthService } from './service';
import { getSessionCookie } from './cookies';

export const requireAuth: MiddlewareHandler<Env> = async (c, next) => {
  const cookie = getSessionCookie(c.req.header('Cookie') ?? null);
  if (!cookie) return c.json({ error: 'Unauthorized' }, 401);

  const svc = new AuthService(c.get('db'), c.env.USER_SESSIONS);
  try {
    const { userId, role } = await svc.validateSession(cookie);
    c.set('userId', userId);
    c.set('userRole', role);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};

export const requireAdmin: MiddlewareHandler<Env> = async (c, next) => {
  if (c.get('userRole') !== 'admin') return c.json({ error: 'Forbidden' }, 403);
  await next();
};
