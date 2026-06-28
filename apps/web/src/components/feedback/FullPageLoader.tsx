import { Loader2 } from 'lucide-react';

interface FullPageLoaderProps {
  title?: string;
  description?: string;
}

export const FullPageLoader = ({
  title = 'Loading...',
  description,
}: FullPageLoaderProps) => (
  <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />

    <div className="space-y-1 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  </div>
);
