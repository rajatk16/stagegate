import z from 'zod';

import { identityResponseSchema } from './identity.js';

const profileText = (max: number) => z.string().trim().min(1).max(max);

const socialUrl = profileText(2_048).pipe(
  z.url({ protocol: /^https$/, normalize: true }).refine((value) => {
    const url = URL.parse(value);
    return url !== null && !url.username && !url.password;
  }, 'Use a URL without embedded credentials'),
);

const socialLinkSchema = z.strictObject({
  label: profileText(40),
  url: socialUrl,
});

export const userProfileFieldsSchema = z.strictObject({
  displayName: profileText(100).nullable(),
  bio: profileText(2_000).nullable(),
  location: profileText(120).nullable(),
  occupation: profileText(120).nullable(),
  contactEmail: profileText(254).pipe(z.email()).nullable(),
  contactPhone: z.string().trim().pipe(z.e164()).nullable(),
  socialLinks: z.array(socialLinkSchema).max(8),
});

export const updateUpserProfileRequestSchema = userProfileFieldsSchema
  .partial()
  .refine(
    (patch) => Object.values(patch).some((value) => value !== undefined),
    {
      message: 'Provide at least one profile field.',
    },
  );

export const userProfileResponseSchema = z.strictObject({
  userId: identityResponseSchema.shape.userId,
  profile: userProfileFieldsSchema
    .extend({ updatedAt: z.iso.datetime() })
    .nullable(),
});

export type UserProfileFields = z.infer<typeof userProfileFieldsSchema>;
export type UpdateUserProfileRequest = z.infer<
  typeof updateUpserProfileRequestSchema
>;
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
