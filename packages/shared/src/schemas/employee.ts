import { z } from 'zod';

export const roleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const employeeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  profilePictureUrl: z.string().nullable(),
  isAdmin: z.boolean(),
  roles: z.array(roleSchema),
  createdAt: z.string(),
});

export const createEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  isAdmin: z.boolean().default(false),
  roleIds: z.array(z.string().uuid()).min(1),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
}).refine(
  (d) => !(d.newPassword && !d.currentPassword),
  { message: 'currentPassword is required when setting a new password', path: ['currentPassword'] }
);

export type Role = z.infer<typeof roleSchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
