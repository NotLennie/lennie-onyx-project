import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../types';
import { requireAuth } from '../auth/middleware';
import {
  clients, appointments, appointmentServices,
  services, serviceRoles, employees, employeeRoles,
  roles, ptoRequests,
} from '../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { createServiceSchema, createEmployeeSchema, adminUpdateEmployeeSchema, updateServiceSchema } from '@project/shared';
import { z } from 'zod';
import { hashPassword } from '../auth/crypto';

export const adminRoutes = new Hono<Env>();

adminRoutes.use('*', requireAuth);
adminRoutes.use('*', async (c, next) => {
  if (c.get('userRole') !== 'admin') return c.json({ error: 'Forbidden' }, 403);
  await next();
});

// ─── Clients ──────────────────────────────────────────────────────────────────

adminRoutes.get('/clients', async (c) => {
  const db = c.get('db');
  const rows = await db
    .select({ id: clients.id, name: clients.name, email: clients.email, phone: clients.phone, address: clients.address, profilePictureUrl: clients.profilePictureUrl, createdAt: clients.createdAt })
    .from(clients)
    .orderBy(clients.name);
  return c.json({ clients: rows });
});

// ─── Appointments ─────────────────────────────────────────────────────────────

adminRoutes.get('/appointments', async (c) => {
  const db = c.get('db');
  const date = c.req.query('date') ?? new Date().toISOString().slice(0, 10);

  const appts = await db
    .select({
      id: appointments.id,
      date: appointments.date,
      status: appointments.status,
      clientName: clients.name,
      createdAt: appointments.createdAt,
    })
    .from(appointments)
    .innerJoin(clients, eq(appointments.clientId, clients.id))
    .where(eq(appointments.date, date))
    .orderBy(appointments.createdAt);

  const result = await Promise.all(appts.map(async (appt) => {
    const svcRows = await db
      .select({
        id: appointmentServices.id,
        serviceName: services.name,
        employeeName: employees.name,
        startTime: appointmentServices.startTime,
        endTime: appointmentServices.endTime,
      })
      .from(appointmentServices)
      .innerJoin(services, eq(appointmentServices.serviceId, services.id))
      .innerJoin(employees, eq(appointmentServices.employeeId, employees.id))
      .where(eq(appointmentServices.appointmentId, appt.id));
    return { ...appt, services: svcRows };
  }));

  return c.json({ appointments: result });
});

adminRoutes.patch('/appointments/:id/status', zValidator('json', z.object({ status: z.enum(['new', 'confirmed', 'cancelled', 'completed']) })), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { status } = c.req.valid('json');

  const [appt] = await db.select({ id: appointments.id }).from(appointments).where(eq(appointments.id, id)).limit(1);
  if (!appt) return c.json({ error: 'Not found' }, 404);

  await db.update(appointments).set({ status }).where(eq(appointments.id, id));
  return c.json({ ok: true });
});

// ─── Services ─────────────────────────────────────────────────────────────────

adminRoutes.get('/services', async (c) => {
  const db = c.get('db');
  const rows = await db
    .select({
      id: services.id,
      name: services.name,
      type: services.type,
      description: services.description,
      price: services.price,
      durationMinutes: services.durationMinutes,
      isActive: services.isActive,
      createdAt: services.createdAt,
      roleIds: sql<string[]>`coalesce(array_agg(${serviceRoles.roleId}) filter (where ${serviceRoles.roleId} is not null), '{}')`,
    })
    .from(services)
    .leftJoin(serviceRoles, eq(services.id, serviceRoles.serviceId))
    .groupBy(services.id)
    .orderBy(services.name);
  return c.json({ services: rows });
});

adminRoutes.post('/services', zValidator('json', createServiceSchema), async (c) => {
  const db = c.get('db');
  const { roleIds, ...rest } = c.req.valid('json');

  const [svc] = await db.insert(services).values(rest).returning();
  await Promise.all(roleIds.map((roleId) =>
    db.insert(serviceRoles).values({ serviceId: svc.id, roleId })
  ));

  return c.json({ service: svc }, 201);
});

adminRoutes.put('/services/:id', zValidator('json', updateServiceSchema), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { roleIds, ...rest } = c.req.valid('json');

  const [existing] = await db.select({ id: services.id }).from(services).where(eq(services.id, id)).limit(1);
  if (!existing) return c.json({ error: 'Not found' }, 404);

  if (Object.keys(rest).length > 0) {
    await db.update(services).set(rest).where(eq(services.id, id));
  }

  if (roleIds) {
    await db.delete(serviceRoles).where(eq(serviceRoles.serviceId, id));
    await Promise.all(roleIds.map((roleId) =>
      db.insert(serviceRoles).values({ serviceId: id, roleId })
    ));
  }

  const [updated] = await db
    .select({
      id: services.id, name: services.name, type: services.type,
      description: services.description, price: services.price, durationMinutes: services.durationMinutes, isActive: services.isActive,
      roleIds: sql<string[]>`coalesce(array_agg(${serviceRoles.roleId}) filter (where ${serviceRoles.roleId} is not null), '{}')`,
    })
    .from(services).leftJoin(serviceRoles, eq(services.id, serviceRoles.serviceId))
    .where(eq(services.id, id)).groupBy(services.id).limit(1);

  return c.json({ service: updated });
});

// ─── Employees ────────────────────────────────────────────────────────────────

adminRoutes.get('/employees', async (c) => {
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

adminRoutes.post('/employees', zValidator('json', createEmployeeSchema), async (c) => {
  const db = c.get('db');
  const { roleIds, password, ...rest } = c.req.valid('json');

  const passwordHash = await hashPassword(password);
  const [emp] = await db.insert(employees).values({ ...rest, passwordHash }).returning();

  await Promise.all(roleIds.map((roleId) =>
    db.insert(employeeRoles).values({ employeeId: emp.id, roleId })
  ));

  return c.json({ employee: { id: emp.id, name: emp.name, email: emp.email, isAdmin: emp.isAdmin } }, 201);
});

adminRoutes.patch('/employees/:id', zValidator('json', adminUpdateEmployeeSchema), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const input = c.req.valid('json');

  const [existing] = await db.select({ id: employees.id }).from(employees).where(eq(employees.id, id)).limit(1);
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const { roleIds, ...rest } = input;

  if (Object.keys(rest).length > 0) {
    await db.update(employees).set(rest).where(eq(employees.id, id));
  }

  if (roleIds) {
    await db.delete(employeeRoles).where(eq(employeeRoles.employeeId, id));
    await Promise.all(roleIds.map((roleId) =>
      db.insert(employeeRoles).values({ employeeId: id, roleId })
    ));
  }

  return c.json({ ok: true });
});

// ─── Roles ────────────────────────────────────────────────────────────────────

adminRoutes.get('/roles', async (c) => {
  const db = c.get('db');
  const rows = await db.select().from(roles).orderBy(roles.name);
  return c.json({ roles: rows });
});

// ─── PTO ──────────────────────────────────────────────────────────────────────

adminRoutes.get('/pto', async (c) => {
  const db = c.get('db');
  const rows = await db
    .select({
      id: ptoRequests.id,
      employeeId: ptoRequests.employeeId,
      employeeName: employees.name,
      date: ptoRequests.date,
      type: ptoRequests.type,
      status: ptoRequests.status,
      note: ptoRequests.note,
      createdAt: ptoRequests.createdAt,
    })
    .from(ptoRequests)
    .innerJoin(employees, eq(ptoRequests.employeeId, employees.id))
    .orderBy(desc(ptoRequests.date));
  return c.json({ pto: rows });
});

adminRoutes.patch('/pto/:id', zValidator('json', z.object({ status: z.enum(['approved', 'declined']) })), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { status } = c.req.valid('json');

  const [pto] = await db.select({ id: ptoRequests.id }).from(ptoRequests).where(eq(ptoRequests.id, id)).limit(1);
  if (!pto) return c.json({ error: 'Not found' }, 404);

  await db.update(ptoRequests).set({ status }).where(eq(ptoRequests.id, id));
  return c.json({ ok: true });
});
