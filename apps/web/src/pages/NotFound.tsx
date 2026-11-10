import { Link } from 'react-router';

export const NotFound = () => (
  <>
    <h1 className="text-3xl font-semibold">Page not found.</h1>
    <Link className="mt-4 inline-block text-primary underline" to="/">
      Return Home
    </Link>
  </>
);
