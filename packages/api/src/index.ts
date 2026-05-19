import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { createDbClient } from './db/client';
import { UserSessions } from './auth/sessions';
import { authRoutes } from './routes/auth';
import { publicRoutes } from './routes/public';
import { clientRoutes } from './routes/client';

const app = new Hono<Env>();

app.use('*', async (c, next) => {
  const allowedOrigin = c.env.ALLOWED_ORIGIN ?? 'http://localhost:5173';
  return cors({
    origin: allowedOrigin,
    allowHeaders: ['Content-Type', 'Cookie'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })(c, next);
});

app.use('*', async (c, next) => {
  c.set('db', createDbClient(c.env.DATABASE_URL));
  await next();
});

app.route('/api/auth', authRoutes);
app.route('/api/public', publicRoutes);
app.route('/api/client', clientRoutes);

export default app;
export { UserSessions };
