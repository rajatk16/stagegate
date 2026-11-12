import z from 'zod';

export const activateIdentityRequestSchema = z.strictObject({}).optional();

export const identityResponseSchema = z.strictObject({
  userId: z.string().min(1),
  email: z.string().min(1),
});

export type IdentityResponse = z.infer<typeof identityResponseSchema>;

export const accountDetailsResponseSchema = identityResponseSchema.extend({
  emailVerified: z.literal(true),
  createdAt: z.iso.datetime().nullable(),
  lastSignInAt: z.iso.datetime().nullable(),
});

export type AccountDetailsResponse = z.infer<
  typeof accountDetailsResponseSchema
>;

export enum IDENTITY_ERROR_CODES {
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  INVALID_ID_TOKEN = 'INVALID_ID_TOKEN',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  IDENTITY_CONFLICT = 'IDENTITY_CONFLICT',
  INVALID_REQUEST = 'INVALID_REQUEST',
  AUTH_UNAVAILABLE = 'AUTH_UNAVAILABLE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  ACCOUNT_ACTIVATION_REQUIRED = 'ACCOUNT_ACTIVATION_REQUIRED',
}

export const identityErrorCodeSchema = z.enum(IDENTITY_ERROR_CODES);

export const identityErrorResponseSchema = z.strictObject({
  code: identityErrorCodeSchema,
  message: z.string(),
  requestId: z.uuid(),
});
