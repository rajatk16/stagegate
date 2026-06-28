import { Loader2 } from 'lucide-react';

import { cn } from '@/lib';

interface InlineLoaderProps {
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export const InlineLoader = ({
  text,
  className,
  size = 'sm',
}: InlineLoaderProps) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizes[size])} />

      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};
