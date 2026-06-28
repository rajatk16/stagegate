import type { ReactNode } from 'react';

import { cn } from '@/lib';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = (props: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed px-8 py-16 text-center',
        props.className,
      )}
    >
      {props.icon && (
        <div className="mb-6 text-muted-foreground">{props.icon}</div>
      )}

      <h2 className="text-xl font-semibold">{props.title}</h2>

      <p className="mt-3 max-w-md text-muted-foreground">{props.description}</p>

      {props.action && <div className="mt-8">{props.action}</div>}
    </div>
  );
};
