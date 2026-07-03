import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';

import { buildHomeRoute } from '@/app';

import { Button } from '../ui';
import { EmptyState } from './EmptyState';

interface NotFoundProps {
  title?: string;
  description?: string;
}

export const NotFound = ({
  title = 'Page not found',
  description = "The page you are looking for doesn't exist or may have been moved.",
}: NotFoundProps) => {
  return (
    <EmptyState
      className="min-h-screen"
      icon={SearchX}
      title={title}
      description={description}
      action={
        <Button asChild>
          <Link to={buildHomeRoute()}>
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
      }
    />
  );
};
