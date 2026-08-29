import { Link } from 'react-router';

import { routes } from '../app/routes';

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <p className="text-brand-600 text-sm font-semibold">Organization workspace</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Dashboard</h1>

        <p className="mt-2 max-w-2xl text-slate-600">
          Manage events, proposal workflows, reviewers, and decisions from one workspace.
        </p>
      </header>

      <section
        aria-labelledby="getting-started-heading"
        className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-950" id="getting-started-heading">
          Get started
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Create or select an event to begin configuring its call for proposals.
        </p>

        <Link
          className="bg-brand-600 hover:bg-brand-700 mt-5 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
          to={routes.events}
        >
          View events
        </Link>
      </section>
    </div>
  );
}
