import { z } from 'zod';

export const appointmentStatusEnum = z.enum(['new', 'confirmed', 'cancelled', 'completed']);

export const appointmentServiceSchema = z.object({
  id: z.string().uuid(),
  serviceId: z.string().uuid(),
  serviceName: z.string(),
  employeeId: z.string().uuid(),
  employeeName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  price: z.string(),
});

export const appointmentSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  date: z.string(),
  status: appointmentStatusEnum,
  services: z.array(appointmentServiceSchema),
  createdAt: z.string(),
});

export const bookingServiceItemSchema = z.object({
  serviceId: z.string().uuid(),
  employeeId: z.string().uuid(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const createAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  services: z.array(bookingServiceItemSchema).min(1),
});

export type AppointmentStatus = z.infer<typeof appointmentStatusEnum>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type BookingServiceItem = z.infer<typeof bookingServiceItemSchema>;
