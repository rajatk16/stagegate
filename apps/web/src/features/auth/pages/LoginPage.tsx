import { Link } from 'react-router-dom';

import { GoogleSignInButton } from '../components';

export const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-md rounded-xl border bg-card p-8">
        <h1 className="mb-2 text-2xl font-bold text-center">
          Welcome to StageGate
        </h1>

        <p className="mb-6 text-muted-foreground text-center">
          Sign in to continue.
        </p>

        <GoogleSignInButton />
        <p className="text-sm mt-6 text-muted-foreground text-center">
          By continuing, you agree to our{' '}
          <Link to="/terms">Terms of Service</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
};
