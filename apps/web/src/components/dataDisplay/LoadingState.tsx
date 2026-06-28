import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  title?: string;
}

export const LoadingState = ({ title }: LoadingStateProps) => (
  <div className="flex flex-col items-center justify-center py-16">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    <p className="mt-4 text-sm text-muted-foreground">{title}</p>
  </div>
);
