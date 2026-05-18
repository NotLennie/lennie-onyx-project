import { z } from 'zod';

export const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  profilePictureUrl: z.string().nullable(),
  createdAt: z.string(),
});

export const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export type Client = z.infer<typeof clientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
