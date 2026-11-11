import { Link } from 'react-router';

export const NotFound = () => (
  <section className="mx-auto flex text-center items-center justify-center max-w-7xl px-4 py-16 sm:px-8">
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found.</h1>
      <p className="mt-3 text-muted-foreground">
        The page may have moved or the address may be incorrect.
      </p>
      <Link
        className="mt-3 inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-primary underline focus-visible:outline-2 focus-visible:outline-offsert-4 focus-visible:outline-ring"
        to="/"
      >
        Return Home
      </Link>
    </div>
  </section>
);
