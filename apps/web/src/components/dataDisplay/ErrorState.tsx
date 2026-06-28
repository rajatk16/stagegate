import { AlertCircle } from 'lucide-react';

import { Button } from '../ui';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState = (props: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <AlertCircle className="mb-6 h-10 w-10 text-destructive" />
      <h2 className="text-xl font-semibold">{props.title}</h2>
      <p className="mt-2 max-w-md text-muted-foreground">{props.description}</p>
      {props.onRetry && (
        <Button className="mt-6" onClick={props.onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
};
