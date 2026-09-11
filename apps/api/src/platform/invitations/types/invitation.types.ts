import { z } from 'zod';

import {
  MembershipRole,
  TenancyError,
  type MembershipStatus,
} from '../../tenancy';

export const INIVITATION_LIFETIME_MS = 72 * 60 * 60 * 1_000;

export const invitationEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email());

export const createInvitationSchema = z.object({
  email: invitationEmailSchema,
  role: z.enum(MembershipRole).refine((role) => role !== MembershipRole.OWNER),
});

export const acceptInvitaitionSchema = z
  .object({
    token: z
      .string()
      .trim()
      .regex(/^[a-f0-9]{64}$/),
  })
  .strict();

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export interface CreateInvitationResponse {
  readonly invitationId: string;
  readonly organizationId: string;
  readonly email: string;
  readonly role: MembershipRole;
  readonly expiresAt: string;
  readonly token: string;
}

export interface AcceptedInvitationResponse {
  readonly organizationId: string;
  readonly membershipId: string;
  readonly role: MembershipRole;
  readonly status: MembershipStatus.ACTIVE;
}

export const parseInvitationInput = <T>(
  schema: z.ZodType<T>,
  value: unknown,
): T => {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new TenancyError(
      'VALIDATION_ERROR',
      result.error.issues.map((issue) => ({
        path: issue.path.map(String).join('.') || 'body',
        code: 'INVALID_FIELD',
        message: 'Invalid, missing, or unsupported field.',
      })),
    );
  }

  return result.data;
};
