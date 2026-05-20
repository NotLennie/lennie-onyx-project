import { Hono } from 'hono';
import type { Env } from '../types';
import { services, serviceRoles } from '../db/schema';
import { eq, sql, and } from 'drizzle-orm';

export const publicRoutes = new Hono<Env>();

publicRoutes.get('/services', async (c) => {
  const db = c.get('db');
  const rows = await db
    .select({
      id: services.id,
      name: services.name,
      type: services.type,
      description: services.description,
      price: services.price,
      durationMinutes: services.durationMinutes,
      createdAt: services.createdAt,
      roleIds: sql<string[]>`coalesce(array_agg(${serviceRoles.roleId}) filter (where ${serviceRoles.roleId} is not null), '{}')`,
    })
    .from(services)
    .leftJoin(serviceRoles, eq(services.id, serviceRoles.serviceId))
    .where(eq(services.isActive, true))
    .groupBy(services.id)
    .orderBy(services.name);

  return c.json({ services: rows });
});

publicRoutes.get('/files/:key{.+}', async (c) => {
  const key = c.req.param('key');
  const object = await c.env.PROFILE_PICTURES.get(key);
  if (!object) return c.notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000');

  return new Response(object.body as ReadableStream, { headers });
});
