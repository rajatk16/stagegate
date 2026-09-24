import { z } from 'zod';

export const userProfileSchema = z.object({
  email: z.string().nullable(),
  uid: z.string().min(1).max(128),
  photoURL: z.string().nullable(),
  displayName: z.string().nullable(),
  biography: z.string().max(1000).nullable().default(null),
  affiliation: z.string().max(120).nullable().default(null),
  timezone: z.string().nullable().default(null),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type UserProfile = z.infer<typeof userProfileSchema>;
