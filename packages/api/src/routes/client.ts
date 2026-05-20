import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../types';
import { requireAuth } from '../auth/middleware';
import {
  clients, appointments, appointmentServices,
  services, employees, employeeRoles, serviceRoles, ptoRequests,
} from '../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { createAppointmentSchema, updateClientSchema } from '@project/shared';
import { hashPassword, verifyPassword } from '../auth/crypto';

export const clientRoutes = new Hono<Env>();

clientRoutes.use('*', requireAuth);
clientRoutes.use('*', async (c, next) => {
  if (c.get('userRole') !== 'client') return c.json({ error: 'Forbidden' }, 403);
  await next();
});

// ─── Appointments ────────────────────────────────────────────────────────────

clientRoutes.get('/appointments', async (c) => {
  const db = c.get('db');
  const clientId = c.get('userId');

  const appts = await db
    .select({
      id: appointments.id,
      date: appointments.date,
      status: appointments.status,
      createdAt: appointments.createdAt,
    })
    .from(appointments)
    .where(eq(appointments.clientId, clientId))
    .orderBy(desc(appointments.date));

  const result = await Promise.all(appts.map(async (appt) => {
    const svcRows = await db
      .select({
        id: appointmentServices.id,
        serviceId: appointmentServices.serviceId,
        serviceName: services.name,
        employeeId: appointmentServices.employeeId,
        employeeName: employees.name,
        startTime: appointmentServices.startTime,
        endTime: appointmentServices.endTime,
        price: services.price,
      })
      .from(appointmentServices)
      .innerJoin(services, eq(appointmentServices.serviceId, services.id))
      .innerJoin(employees, eq(appointmentServices.employeeId, employees.id))
      .where(eq(appointmentServices.appointmentId, appt.id));
    return { ...appt, services: svcRows };
  }));

  return c.json({ appointments: result });
});

clientRoutes.post('/appointments', zValidator('json', createAppointmentSchema), async (c) => {
  const db = c.get('db');
  const clientId = c.get('userId');
  const input = c.req.valid('json');

  const dayOfWeek = new Date(input.date + 'T00:00:00').getDay();
  if (![0, 4, 5, 6].includes(dayOfWeek)) {
    return c.json({ error: 'Appointments can only be booked Thursday through Sunday' }, 422);
  }

  for (const svcItem of input.services) {
    const [svc] = await db.select({ durationMinutes: services.durationMinutes })
      .from(services).where(eq(services.id, svcItem.serviceId)).limit(1);
    if (!svc) return c.json({ error: `Service ${svcItem.serviceId} not found` }, 404);

    const endTime = computeEndTime(svcItem.startTime, svc.durationMinutes);
    if (!isWithinHours(svcItem.startTime, endTime)) {
      return c.json({ error: 'Time slot falls outside operating hours (7:00–19:00)' }, 422);
    }
  }

  const [appt] = await db.insert(appointments)
    .values({ clientId, date: input.date, status: 'new' })
    .returning();

  for (const svcItem of input.services) {
    const [svc] = await db.select({ durationMinutes: services.durationMinutes })
      .from(services).where(eq(services.id, svcItem.serviceId)).limit(1);
    const endTime = computeEndTime(svcItem.startTime, svc!.durationMinutes);
    await db.insert(appointmentServices).values({
      appointmentId: appt.id,
      serviceId: svcItem.serviceId,
      employeeId: svcItem.employeeId,
      startTime: svcItem.startTime,
      endTime,
    });
  }

  return c.json({ appointment: { id: appt.id, date: appt.date, status: appt.status } }, 201);
});

clientRoutes.patch('/appointments/:id/cancel', async (c) => {
  const db = c.get('db');
  const clientId = c.get('userId');
  const id = c.req.param('id');

  const [appt] = await db.select({ id: appointments.id, clientId: appointments.clientId, status: appointments.status })
    .from(appointments).where(eq(appointments.id, id)).limit(1);

  if (!appt) return c.json({ error: 'Not found' }, 404);
  if (appt.clientId !== clientId) return c.json({ error: 'Forbidden' }, 403);
  if (appt.status === 'cancelled') return c.json({ error: 'Already cancelled' }, 422);

  await db.update(appointments).set({ status: 'cancelled' }).where(eq(appointments.id, id));
  return c.json({ ok: true });
});

// ─── Availability ─────────────────────────────────────────────────────────────

clientRoutes.get('/availability', async (c) => {
  const date = c.req.query('date');
  const serviceId = c.req.query('serviceId');
  const startTime = c.req.query('startTime');

  if (!date || !serviceId || !startTime) {
    return c.json({ error: 'date, serviceId, and startTime are required' }, 400);
  }

  const db = c.get('db');

  const [svc] = await db.select({ durationMinutes: services.durationMinutes })
    .from(services).where(eq(services.id, serviceId)).limit(1);
  if (!svc) return c.json({ error: 'Service not found' }, 404);

  const endTime = computeEndTime(startTime, svc.durationMinutes);

  const available = await db
    .selectDistinct({ id: employees.id, name: employees.name })
    .from(employees)
    .innerJoin(employeeRoles, eq(employees.id, employeeRoles.employeeId))
    .innerJoin(serviceRoles, eq(employeeRoles.roleId, serviceRoles.roleId))
    .where(and(
      eq(serviceRoles.serviceId, serviceId),
      sql`${employees.id} not in (
        select employee_id from pto_requests
        where date = ${date} and status = 'approved'
      )`,
      sql`${employees.id} not in (
        select aps.employee_id from appointment_services aps
        join appointments a on aps.appointment_id = a.id
        where a.date = ${date}
          and a.status != 'cancelled'
          and aps.start_time::time < ${endTime}::time
          and aps.end_time::time > ${startTime}::time
      )`,
    ))
    .orderBy(employees.name);

  return c.json({ employees: available });
});

// ─── Profile ──────────────────────────────────────────────────────────────────

clientRoutes.get('/profile', async (c) => {
  const db = c.get('db');
  const [client] = await db
    .select({ id: clients.id, name: clients.name, email: clients.email, profilePictureUrl: clients.profilePictureUrl, createdAt: clients.createdAt })
    .from(clients).where(eq(clients.id, c.get('userId'))).limit(1);
  if (!client) return c.json({ error: 'Not found' }, 404);
  return c.json({ user: client });
});

clientRoutes.put('/profile', zValidator('json', updateClientSchema), async (c) => {
  const db = c.get('db');
  const input = c.req.valid('json');
  const userId = c.get('userId');

  const [existing] = await db.select().from(clients).where(eq(clients.id, userId)).limit(1);
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const updates: Partial<typeof clients.$inferInsert> = {};

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

  await db.update(clients).set(updates).where(eq(clients.id, userId));
  const [updated] = await db
    .select({ id: clients.id, name: clients.name, email: clients.email, profilePictureUrl: clients.profilePictureUrl })
    .from(clients).where(eq(clients.id, userId)).limit(1);

  return c.json({ user: updated });
});

clientRoutes.post('/profile/picture', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'file field required' }, 400);
  }

  const userId = c.get('userId');
  const ext = file.name.split('.').pop() ?? 'jpg';
  const key = `profile-pictures/${userId}.${ext}`;
  const bytes = await file.arrayBuffer();

  await c.env.PROFILE_PICTURES.put(key, bytes, {
    httpMetadata: { contentType: file.type },
  });

  const apiBase = new URL(c.req.url).origin;
  const url = `${apiBase}/api/public/files/${key}`;

  await c.get('db').update(clients).set({ profilePictureUrl: url }).where(eq(clients.id, userId));
  return c.json({ url });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const total = h * 60 + m + durationMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function isWithinHours(startTime: string, endTime: string): boolean {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return sh * 60 + sm >= 7 * 60 && eh * 60 + em <= 19 * 60;
}
