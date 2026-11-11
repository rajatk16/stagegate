import z from 'zod';

const email = z
  .string()
  .trim()
  .pipe(
    z.email({
      pattern: z.regexes.html5Email,
      error: 'Enter a valid email address.',
    }),
  );

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.'),
});

export const signUpSchema = signInSchema.extend({
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .max(128, 'Use no more that 128 characters'),
});

export const passwordResetSchema = signInSchema.pick({ email: true });

export type CredentialValues = z.infer<typeof signInSchema>;
export type PasswordResetValues = z.infer<typeof passwordResetSchema>;
