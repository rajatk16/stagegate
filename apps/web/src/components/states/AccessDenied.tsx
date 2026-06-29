import { ArrowLeft, ShieldX } from 'lucide-react';

import { Button } from '../ui';
import { EmptyState } from './EmptyState';

interface AccessDeniedProps {
  title?: string;
  description?: string;
  onGoBack?: () => void;
}

export const AccessDenied = ({
  title = 'Access Denied',
  description = 'You are not authorized to access this resource.',
  onGoBack,
}: AccessDeniedProps) => {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={ShieldX}
      action={
        onGoBack ? (
          <Button variant="outline" onClick={onGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        ) : undefined
      }
    />
  );
};
