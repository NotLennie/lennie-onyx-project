import { z } from 'zod';

export const serviceTypeEnum = z.enum([
  'haircut', 'custom_coloring', 'treatment',
  'straightening', 'rebond', 'perming', 'specialized_styling',
]);

export const serviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: serviceTypeEnum,
  description: z.string().nullable(),
  price: z.string(),
  durationMinutes: z.number().int().positive(),
  isActive: z.boolean(),
  roleIds: z.array(z.string().uuid()),
  createdAt: z.string(),
});

export const createServiceSchema = z.object({
  name: z.string().min(1),
  type: serviceTypeEnum,
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  durationMinutes: z.number().int().positive(),
  roleIds: z.array(z.string().uuid()).min(1),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type ServiceType = z.infer<typeof serviceTypeEnum>;
export type Service = z.infer<typeof serviceSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
