import { z } from 'zod';

export const userProfileSchema = z.object({
  email: z.string().nullable(),
  uid: z.string().min(1).max(128),
  photoURL: z.string().nullable(),
  displayName: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type UserProfile = z.infer<typeof userProfileSchema>;
