import type { ComponentProps } from 'react';

import { cn } from '@/lib';
import { Skeleton } from '@/components/ui';

type SkeletonBlockProps = ComponentProps<typeof Skeleton>;

export const SkeletonBlock = ({ className }: SkeletonBlockProps) => (
  <Skeleton className={cn('rounded-md', className)} />
);
