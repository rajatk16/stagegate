import { z } from 'zod';

import { OrganizationRole } from '../../types';

export const inviteMemberFormSchema = z.object({
  email: z.email('Please enter a valid email address'),
  role: z.enum(OrganizationRole),
});

export type InviteMemberFormSchema = z.infer<typeof inviteMemberFormSchema>;
