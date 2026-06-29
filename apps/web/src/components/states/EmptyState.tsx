import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib';

interface EmptyStateProps {
  title: string;
  compact?: boolean;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
  description?: string;
}

export const EmptyState = ({ compact = false, ...props }: EmptyStateProps) => {
  const Icon = props.icon;
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 text-center',
        compact ? 'px-6 py-10' : 'px-8 py-16',
        props.className,
      )}
    >
      {Icon && (
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-7 w-7" />
        </div>
      )}

      <h2 className="text-xl font-semibold tracking-tight">{props.title}</h2>
      {props.description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {props.description}
        </p>
      )}

      {props.action && <div className="mt-8">{props.action}</div>}
    </div>
  );
};
