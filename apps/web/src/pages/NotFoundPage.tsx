import { Link } from 'react-router';

import { routes } from '../app/routes';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="text-brand-600 text-sm font-semibold">404</p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Page not found</h1>

      <p className="mt-3 text-slate-600">
        The page you requested does not exist or may have moved.
      </p>

      <Link
        className="bg-brand-600 hover:bg-brand-700 mt-6 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
        to={routes.dashboard}
      >
        Return to dashboard
      </Link>
    </div>
  );
}
