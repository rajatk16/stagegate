import type { ReactNode } from 'react';

import { cn } from '@/lib';

interface SectionHeaderProps {
  title: string;

  description?: string;

  actions?: ReactNode;

  className?: string;
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-start md:justify-between',
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
