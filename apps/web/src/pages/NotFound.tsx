import { Link } from 'react-router';

export const NotFound = () => (
  <>
    <h1 className="text-2xl font-semibold sm:text-3xl">Page not found.</h1>
    <Link
      className="mt-3 inline-flex min-h-11 items-center text-primary underline"
      to="/"
    >
      Return Home
    </Link>
  </>
);
