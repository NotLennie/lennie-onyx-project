import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types';
import { requireAuth } from '../auth/middleware';
import {
  employees, appointments, appointmentServices,
  services, serviceRoles, clients, ptoRequests, roles, employeeRoles,
} from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { updateEmployeeSchema, createPtoRequestSchema } from '@project/shared';
import { hashPassword, verifyPassword } from '../auth/crypto';

export const employeeRoutes = new Hono<Env>();

employeeRoutes.use('*', requireAuth);
employeeRoutes.use('*', async (c, next) => {
  const role = c.get('userRole');
  if (role !== 'employee' && role !== 'admin') return c.json({ error: 'Forbidden' }, 403);
  await next();
});

// ─── Appointments ─────────────────────────────────────────────────────────────

employeeRoutes.get('/appointments', async (c) => {
  const db = c.get('db');
  const employeeId = c.get('userId');
  const date = c.req.query('date');

  const conditions = [eq(appointmentServices.employeeId, employeeId)];
  if (date) conditions.push(eq(appointments.date, date));

  const rows = await db
    .select({
      appointmentId: appointments.id,
      date: appointments.date,
      status: appointments.status,
      clientName: clients.name,
      serviceId: services.id,
      serviceName: services.name,
      price: services.price,
      startTime: appointmentServices.startTime,
      endTime: appointmentServices.endTime,
    })
    .from(appointmentServices)
    .innerJoin(appointments, eq(appointmentServices.appointmentId, appointments.id))
    .innerJoin(services, eq(appointmentServices.serviceId, services.id))
    .innerJoin(clients, eq(appointments.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(appointments.date, appointmentServices.startTime);

  return c.json({ appointments: rows });
});

employeeRoutes.patch('/appointments/:id/status', zValidator('json', z.object({ status: z.enum(['new', 'confirmed', 'cancelled', 'completed']) })), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { status } = c.req.valid('json');

  const [appt] = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1);

  if (!appt) return c.json({ error: 'Not found' }, 404);

  await db.update(appointments).set({ status }).where(eq(appointments.id, id));
  return c.json({ ok: true });
});

// ─── Clients ──────────────────────────────────────────────────────────────────

employeeRoutes.get('/clients', async (c) => {
  const db = c.get('db');
  const rows = await db
    .select({ id: clients.id, name: clients.name, email: clients.email, phone: clients.phone, address: clients.address, profilePictureUrl: clients.profilePictureUrl, createdAt: clients.createdAt })
    .from(clients)
    .orderBy(clients.name);
  return c.json({ clients: rows });
});

// ─── Services ─────────────────────────────────────────────────────────────────

employeeRoutes.get('/services', async (c) => {
  const db = c.get('db');
  const rows = await db
    .select({
      id: services.id, name: services.name, type: services.type,
      description: services.description, price: services.price,
      durationMinutes: services.durationMinutes, isActive: services.isActive,
      createdAt: services.createdAt,
      roleIds: sql<string[]>`coalesce(array_agg(${serviceRoles.roleId}) filter (where ${serviceRoles.roleId} is not null), '{}')`,
    })
    .from(services)
    .leftJoin(serviceRoles, eq(services.id, serviceRoles.serviceId))
    .groupBy(services.id)
    .orderBy(services.name);
  return c.json({ services: rows });
});

// ─── Employees ────────────────────────────────────────────────────────────────

employeeRoutes.get('/employees', async (c) => {
  const db = c.get('db');
  const emps = await db
    .select({ id: employees.id, name: employees.name, email: employees.email, profilePictureUrl: employees.profilePictureUrl, isAdmin: employees.isAdmin, isActive: employees.isActive, createdAt: employees.createdAt })
    .from(employees)
    .orderBy(employees.name);

  const result = await Promise.all(emps.map(async (emp) => {
    const roleRows = await db
      .select({ id: roles.id, name: roles.name })
      .from(employeeRoles)
      .innerJoin(roles, eq(employeeRoles.roleId, roles.id))
      .where(eq(employeeRoles.employeeId, emp.id));
    return { ...emp, roles: roleRows };
  }));

  return c.json({ employees: result });
});

// ─── Roles ────────────────────────────────────────────────────────────────────

employeeRoutes.get('/roles', async (c) => {
  const db = c.get('db');
  const rows = await db.select().from(roles).orderBy(roles.name);
  return c.json({ roles: rows });
});

// ─── PTO ──────────────────────────────────────────────────────────────────────

employeeRoutes.get('/pto', async (c) => {
  const db = c.get('db');
  const employeeId = c.get('userId');
  const isAdmin = c.get('userRole') === 'admin';

  const baseSelect = {
    id: ptoRequests.id,
    employeeId: ptoRequests.employeeId,
    employeeName: employees.name,
    date: ptoRequests.date,
    type: ptoRequests.type,
    status: ptoRequests.status,
    note: ptoRequests.note,
    createdAt: ptoRequests.createdAt,
  };

  if (isAdmin) {
    const rows = await db
      .select(baseSelect)
      .from(ptoRequests)
      .innerJoin(employees, eq(ptoRequests.employeeId, employees.id))
      .orderBy(desc(ptoRequests.date));
    return c.json({ pto: rows });
  }

  const rows = await db
    .select(baseSelect)
    .from(ptoRequests)
    .innerJoin(employees, eq(ptoRequests.employeeId, employees.id))
    .where(eq(ptoRequests.employeeId, employeeId))
    .orderBy(desc(ptoRequests.date));
  return c.json({ pto: rows });
});

employeeRoutes.post('/pto', zValidator('json', createPtoRequestSchema), async (c) => {
  const db = c.get('db');
  const employeeId = c.get('userId');
  const input = c.req.valid('json');

  const [existing] = await db
    .select({ id: ptoRequests.id })
    .from(ptoRequests)
    .where(and(eq(ptoRequests.employeeId, employeeId), eq(ptoRequests.date, input.date)))
    .limit(1);

  if (existing) return c.json({ error: 'PTO already requested for this date' }, 422);

  const [pto] = await db.insert(ptoRequests)
    .values({ employeeId, date: input.date, type: input.type, note: input.note ?? null })
    .returning();

  return c.json({ pto }, 201);
});

employeeRoutes.delete('/pto/:id', async (c) => {
  const db = c.get('db');
  const employeeId = c.get('userId');
  const id = c.req.param('id');

  const [pto] = await db
    .select({ id: ptoRequests.id, status: ptoRequests.status, employeeId: ptoRequests.employeeId })
    .from(ptoRequests)
    .where(eq(ptoRequests.id, id))
    .limit(1);

  if (!pto) return c.json({ error: 'Not found' }, 404);
  if (pto.employeeId !== employeeId) return c.json({ error: 'Forbidden' }, 403);
  if (pto.status !== 'pending') return c.json({ error: 'Can only delete pending requests' }, 422);

  await db.delete(ptoRequests).where(eq(ptoRequests.id, id));
  return c.json({ ok: true });
});

employeeRoutes.patch('/pto/:id/status', zValidator('json', z.object({ status: z.enum(['approved', 'declined']) })), async (c) => {
  if (c.get('userRole') !== 'admin') return c.json({ error: 'Forbidden' }, 403);

  const db = c.get('db');
  const id = c.req.param('id');
  const { status } = c.req.valid('json');

  const [pto] = await db.select({ id: ptoRequests.id }).from(ptoRequests).where(eq(ptoRequests.id, id)).limit(1);
  if (!pto) return c.json({ error: 'Not found' }, 404);

  await db.update(ptoRequests).set({ status }).where(eq(ptoRequests.id, id));
  return c.json({ ok: true });
});

// ─── Profile ──────────────────────────────────────────────────────────────────

employeeRoutes.get('/profile', async (c) => {
  const db = c.get('db');
  const [emp] = await db
    .select({ id: employees.id, name: employees.name, email: employees.email, profilePictureUrl: employees.profilePictureUrl, isAdmin: employees.isAdmin, createdAt: employees.createdAt })
    .from(employees).where(eq(employees.id, c.get('userId'))).limit(1);
  if (!emp) return c.json({ error: 'Not found' }, 404);
  return c.json({ user: emp });
});

employeeRoutes.put('/profile', zValidator('json', updateEmployeeSchema), async (c) => {
  const db = c.get('db');
  const input = c.req.valid('json');
  const userId = c.get('userId');

  const [existing] = await db.select().from(employees).where(eq(employees.id, userId)).limit(1);
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const updates: Partial<typeof employees.$inferInsert> = {};

  if (input.name) updates.name = input.name;

  if (input.email && input.email !== existing.email) {
    if (!input.currentPassword) return c.json({ error: 'Password required to change email' }, 422);
    if (!await verifyPassword(input.currentPassword, existing.passwordHash)) {
      return c.json({ error: 'Incorrect password' }, 422);
    }
    updates.email = input.email.toLowerCase();
  }

  if (input.newPassword) {
    if (!await verifyPassword(input.currentPassword!, existing.passwordHash)) {
      return c.json({ error: 'Incorrect current password' }, 422);
    }
    updates.passwordHash = await hashPassword(input.newPassword);
  }

  if (Object.keys(updates).length === 0) return c.json({ error: 'Nothing to update' }, 422);

  await db.update(employees).set(updates).where(eq(employees.id, userId));
  const [updated] = await db
    .select({ id: employees.id, name: employees.name, email: employees.email, profilePictureUrl: employees.profilePictureUrl, isAdmin: employees.isAdmin })
    .from(employees).where(eq(employees.id, userId)).limit(1);

  return c.json({ user: updated });
});

employeeRoutes.post('/profile/picture', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof File)) return c.json({ error: 'file field required' }, 400);

  const userId = c.get('userId');
  const ext = file.name.split('.').pop() ?? 'jpg';
  const key = `profile-pictures/${userId}.${ext}`;
  const bytes = await file.arrayBuffer();

  await c.env.PROFILE_PICTURES.put(key, bytes, { httpMetadata: { contentType: file.type } });

  const apiBase = new URL(c.req.url).origin;
  const url = `${apiBase}/api/public/files/${key}`;

  await c.get('db').update(employees).set({ profilePictureUrl: url }).where(eq(employees.id, userId));
  return c.json({ url });
});
