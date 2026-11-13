import { cn } from '@/lib/utils';

import type { ComponentProps } from 'react';

export const Skeleton = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="skeleton"
    aria-hidden="true"
    className={cn('animate-pulse rounded-md bg-muted', className)}
    {...props}
  />
);
