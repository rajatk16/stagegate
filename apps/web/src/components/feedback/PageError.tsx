import { AlertTriangle } from 'lucide-react';

import { Button } from '../ui';

interface PageErrorProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export const PageError = ({
  title = 'Something went wrong',
  description = 'An unexpected error occurred while loading this page.',
  retryLabel = 'Try again?',
  onRetry,
}: PageErrorProps) => {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-8 text-center">
      <AlertTriangle className="mb-6 h-12 w-12 text-destructive" />
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-md text-muted-foreground">{description}</p>
      {onRetry && (
        <Button className="mt-8" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
