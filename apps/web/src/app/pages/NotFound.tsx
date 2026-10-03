import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

import { useAuth } from '@/features';
import { Button } from '@/components';

export const NotFound = () => {
  const session = useAuth();
  const signedIn = session.status === 'authenticated';

  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center space-y-5 text-center">
      <p className="text-7xl font-semibold tracking-tight text-primary">404</p>

      <h1 className="text-2xl font-semibold">Page not found</h1>

      <p className="max-w-md text-muted-foreground">
        This page may have moved, or the address may be incorrect.
      </p>

      <Button asChild className="min-h-11">
        <Link to={signedIn ? '/dashboard' : '/'}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          {signedIn ? 'Back to dashboard' : 'Back to home'}
        </Link>
      </Button>
    </section>
  );
};
