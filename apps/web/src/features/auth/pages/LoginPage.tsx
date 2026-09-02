import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthLayout } from '../components';
import { routes } from '../../../app/routes';
import { signInWithPassword } from '../services';
import { loginSchema, type LoginValues } from '../schemas';

export function LoginPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (values: LoginValues) => {
    try {
      await signInWithPassword(values.email, values.password);
      await navigate(routes.dashboard, { replace: true });
    } catch {
      setError('root', {
        message: 'We could not sign you in. Check your details and try again.',
      });
    }
  };

  return (
    <AuthLayout
      description="Use your email address and password to continue."
      footer={
        <>
          Need an account?{' '}
          <Link className="text-brand-700 font-semibold hover:underline" to={routes.signUp}>
            Create one
          </Link>
        </>
      }
      title="Sign in"
    >
      <form
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(handleLogin)(event);
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
          <label className="block text-sm font-semibold text-slate-800" htmlFor="login-email">
            Email address
          </label>

          <input
            {...register('email')}
            aria-describedby={errors.email === undefined ? undefined : 'login-email-error'}
            aria-invalid={errors.email !== undefined}
            autoComplete="email"
            className="focus:border-brand-600 mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 shadow-sm"
            id="login-email"
            inputMode="email"
            type="email"
          />

          {errors.email?.message !== undefined ? (
            <p className="mt-2 text-sm text-red-700" id="login-email-error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="login-password">
            Password
          </label>

          <input
            {...register('password')}
            aria-describedby={errors.password === undefined ? undefined : 'login-password-error'}
            aria-invalid={errors.password !== undefined}
            autoComplete="current-password"
            className="focus:border-brand-600 mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 shadow-sm"
            id="login-password"
            type="password"
          />

          {errors.password?.message !== undefined ? (
            <p className="mt-2 text-sm text-red-700" id="login-password-error">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <button
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
