import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { createDbClient } from './db/client';
import { UserSessions } from './auth/sessions';
import { authRoutes } from './routes/auth';

const app = new Hono<Env>();

app.use('*', cors({
  origin: (origin) => origin,
  allowHeaders: ['Content-Type', 'Cookie'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use('*', async (c, next) => {
  c.set('db', createDbClient(c.env.DATABASE_URL));
  await next();
});

app.route('/api/auth', authRoutes);

export default app;
export { UserSessions };
