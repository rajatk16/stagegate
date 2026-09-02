import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthLayout } from '../components';
import { routes } from '../../../app/routes';
import { createPasswordAccount } from '../services';
import { signUpSchema, type SignUpValues } from '../schemas';

export const SignUpPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSignUp = async (values: SignUpValues) => {
    try {
      await createPasswordAccount(values.email, values.password);
      await navigate(routes.dashboard, { replace: true });
    } catch {
      setError('root', {
        message: 'We could not create your account. Check your details and try again.',
      });
    }
  };

  return (
    <AuthLayout
      description="Create an account to submit proposals and manage events."
      footer={
        <>
          Already have an account?{' '}
          <Link className="text-brand-700 font-semibold hover:underline" to={routes.login}>
            Sign in
          </Link>
        </>
      }
      title="Create your account"
    >
      <form
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(handleSignUp)(event);
        }}
      >
        {errors.root?.message !== undefined ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {errors.root.message}
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="sign-up-email">
            Email address
          </label>

          <input
            {...register('email')}
            aria-describedby={errors.email === undefined ? undefined : 'sign-up-email-error'}
            aria-invalid={errors.email !== undefined}
            autoComplete="email"
            className="focus:border-brand-600 mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 shadow-sm"
            id="sign-up-email"
            inputMode="email"
            type="email"
          />

          {errors.email?.message !== undefined ? (
            <p className="mt-2 text-sm text-red-700" id="sign-up-email-error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="sign-up-password">
            Password
          </label>

          <input
            {...register('password')}
            aria-describedby={
              errors.password === undefined
                ? 'sign-up-password-help'
                : 'sign-up-password-help sign-up-password-error'
            }
            aria-invalid={errors.password !== undefined}
            autoComplete="new-password"
            className="focus:border-brand-600 mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 shadow-sm"
            id="sign-up-password"
            type="password"
          />

          <p className="mt-2 text-sm text-slate-600" id="sign-up-password-help">
            Use at least 12 characters.
          </p>

          {errors.password?.message !== undefined ? (
            <p className="mt-2 text-sm text-red-700" id="sign-up-password-error">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            className="block text-sm font-semibold text-slate-800"
            htmlFor="sign-up-confirm-password"
          >
            Confirm password
          </label>

          <input
            {...register('confirmPassword')}
            aria-describedby={
              errors.confirmPassword === undefined ? undefined : 'sign-up-confirm-password-error'
            }
            aria-invalid={errors.confirmPassword !== undefined}
            autoComplete="new-password"
            className="focus:border-brand-600 mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 shadow-sm"
            id="sign-up-confirm-password"
            type="password"
          />

          {errors.confirmPassword?.message !== undefined ? (
            <p className="mt-2 text-sm text-red-700" id="sign-up-confirm-password-error">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <button
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};
