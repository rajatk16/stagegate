import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  loading: boolean;
  text?: string;
}

export const LoadingOverlay = ({
  text = 'Loading...',
  ...props
}: LoadingOverlayProps) => {
  if (!props.loading) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
};
