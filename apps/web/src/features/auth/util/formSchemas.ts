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

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: signUpSchema.shape.password,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'Choose a password different from your current one.',
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The new passwords do not match.',
  });

export type CredentialValues = z.infer<typeof signInSchema>;
export type PasswordResetValues = z.infer<typeof passwordResetSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
