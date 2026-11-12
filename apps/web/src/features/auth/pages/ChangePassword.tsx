import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { FirebaseError } from 'firebase/app';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/form/FormFields';
import { InputGroupInput } from '@/components/ui/inputGroup';
import { PageContainer } from '@/components/layout/PageContainer';

import { useAuth } from '../context/auth';
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from '../util/formSchemas';

const fields = [
  {
    name: 'currentPassword',
    label: 'Current password',
    autoComplete: 'current-password',
  },
  {
    name: 'newPassword',
    label: 'New password',
    autoComplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm new password',
    autoComplete: 'new-password',
  },
] as const;

export const ChangePassword = () => {
  const { changePassword } = useAuth();
  const [changed, setChanged] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: '',
      currentPassword: '',
      confirmPassword: '',
    },
  });

  const submit = async ({
    currentPassword,
    newPassword,
  }: ChangePasswordValues) => {
    try {
      await changePassword(currentPassword, newPassword);
    } catch (error) {
      const code = error instanceof FirebaseError ? error.code : undefined;
      switch (code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
          setError(
            'currentPassword',
            { message: 'Your current password is incorrect.' },
            { shouldFocus: true },
          );
          break;
        case 'auth/weak-password':
        case 'auth/password-does-not-meet-requirements':
          setError(
            'newPassword',
            {
              message:
                'Choose a stronger password that meets the account requirements.',
            },
            { shouldFocus: true },
          );
          break;
        case 'auth/too-many-requests':
          setError('root.server', {
            message: 'Too many attempts. Wait a moment and try again.',
          });
          break;
        case 'auth/requires-recent-login':
        case 'auth/user-token-expired':
        case 'auth/user-mismatch':
          setError('root.server', {
            message:
              'Sign out and sign in again before changing your password.',
          });
          break;
        default:
          setError('root.server', {
            message:
              'We couldn’t confirm the password change. Check your connection and try again.',
          });
      }
      return;
    }
    reset();
    setChanged(true);
  };

  return (
    <PageContainer
      title="Change password"
      description={
        changed
          ? 'Use your new password the next time you sign in.'
          : 'Enter your current password and choose a new one.'
      }
    >
      {changed ? (
        <p role="status" className="text-sm font-medium">
          Your password was changed.
        </p>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={handleSubmit(submit)}
          aria-busy={isSubmitting}
          noValidate
        >
          {fields.map(({ name, label, autoComplete }) => (
            <FormField
              key={name}
              id={`password-change-${name}`}
              label={label}
              description={
                name === 'newPassword' ? 'Use at least 8 characters' : undefined
              }
              error={errors[name]?.message}
            >
              {(control) => (
                <InputGroupInput
                  {...register(name)}
                  {...control}
                  type="password"
                  autoComplete={autoComplete}
                  readOnly={isSubmitting}
                  required
                />
              )}
            </FormField>
          ))}
          {errors.root?.server && (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.server.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-h-11 w-full cursor-pointer"
          >
            {isSubmitting ? 'Changing password...' : 'Change password'}
          </Button>
        </form>
      )}
      <Link
        to="/app"
        className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
      >
        Back to workspace
      </Link>
    </PageContainer>
  );
};
