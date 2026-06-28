import type { PropsWithChildren } from 'react';

import { cn } from '@/lib';

interface PageContentProps extends PropsWithChildren {
  className?: string;
}

export const PageContent = ({ children, className }: PageContentProps) => {
  return (
    <div className={cn('flex flex-1 flex-col gap-6', className)}>
      {children}
    </div>
  );
};
