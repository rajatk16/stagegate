import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div
      className="
      flex
      min-h-screen
      flex-col
      items-center
      justify-center
      "
    >
      <h1 className="text-6xl font-bold">404</h1>

      <p className="mt-4">Page not found</p>

      <Link className="mt-6 underline" to="/">
        Return Home
      </Link>
    </div>
  );
};
