import { Link } from 'react-router';
import type { PropsWithChildren, ReactNode } from 'react';

import { routes } from '../../../app/routes';
import { environment } from '../../../config/environment';

interface AuthLayoutProps {
  readonly title: string;
  readonly description: string;
  readonly footer: ReactNode;
}

export const AuthLayout = (props: PropsWithChildren<AuthLayoutProps>) => (
  <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-12">
    <section
      aria-labelledby="auth-page-heading"
      className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <Link
        className="text-brand-700 inline-block text-xl font-bold tracking-tight"
        to={routes.dashboard}
      >
        {environment.appName}
      </Link>

      <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-950" id="auth-page-heading">
        {props.title}
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-600">{props.description}</p>

      <div className="mt-8">{props.children}</div>

      <div className="mt-6 text-center text-sm text-slate-600">{props.footer}</div>
    </section>
  </main>
);
