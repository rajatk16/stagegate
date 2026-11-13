import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router';

import { paths } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';

export const UnauthorizedPage = () => (
  <div className="flex min-h-[65vh] items-center justify-center px-6 py-16">
    <div className="max-w-md space-y-4 text-center">
      <ShieldAlert className="mx-auto size-14 text-primary" aria-hidden="true" />

      <h1 className="text-2xl font-semibold">Access denied</h1>

      <p className="text-muted-foreground">
        You do not have permission to access the requested resource.
      </p>

      <Button asChild>
        <Link to={paths.home}>Return home</Link>
      </Button>
    </div>
  </div>
);
