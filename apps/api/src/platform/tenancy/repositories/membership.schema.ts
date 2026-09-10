import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';

import { MembershipRole, MembershipStatus } from '../types';

export const storedMembershipSchema = z.object({
  membershipId: z.string().min(1),
  organizationId: z.string().min(1),
  userId: z.string().min(1).max(128),
  role: z.enum(MembershipRole),
  status: z.enum(MembershipStatus),
  version: z.number().int().positive(),
  schemaVersion: z.literal(1),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
});
