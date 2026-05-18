import {
  pgTable, pgEnum, uuid, text, boolean,
  timestamp, date, time, numeric, integer,
} from 'drizzle-orm/pg-core';

export const serviceTypeEnum = pgEnum('service_type', [
  'haircut', 'custom_coloring', 'treatment',
  'straightening', 'rebond', 'perming', 'specialized_styling',
]);

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'confirmed', 'cancelled', 'completed',
]);

export const ptoTypeEnum = pgEnum('pto_type', [
  'personal', 'holiday', 'sick_leave', 'maternity', 'paternity', 'bereavement',
]);

export const ptoStatusEnum = pgEnum('pto_status', [
  'pending', 'approved', 'declined',
]);

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  profilePictureUrl: text('profile_picture_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const employees = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  profilePictureUrl: text('profile_picture_url'),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique().notNull(),
});

export const employeeRoles = pgTable('employee_roles', {
  employeeId: uuid('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: serviceTypeEnum('type').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const serviceRoles = pgTable('service_roles', {
  serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
});

export const ptoRequests = pgTable('pto_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  type: ptoTypeEnum('type').notNull(),
  status: ptoStatusEnum('status').default('pending').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  status: appointmentStatusEnum('status').default('confirmed').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const appointmentServices = pgTable('appointment_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
});
