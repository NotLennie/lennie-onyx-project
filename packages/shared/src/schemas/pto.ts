import { z } from 'zod';

export const ptoTypeEnum = z.enum([
  'personal', 'holiday', 'sick_leave', 'maternity', 'paternity', 'bereavement',
]);

export const ptoStatusEnum = z.enum(['pending', 'approved', 'declined']);

export const ptoRequestSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().uuid(),
  employeeName: z.string(),
  date: z.string(),
  type: ptoTypeEnum,
  status: ptoStatusEnum,
  note: z.string().nullable(),
  createdAt: z.string(),
});

export const createPtoRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: ptoTypeEnum,
  note: z.string().optional(),
});

export type PtoType = z.infer<typeof ptoTypeEnum>;
export type PtoStatus = z.infer<typeof ptoStatusEnum>;
export type PtoRequest = z.infer<typeof ptoRequestSchema>;
export type CreatePtoRequestInput = z.infer<typeof createPtoRequestSchema>;
