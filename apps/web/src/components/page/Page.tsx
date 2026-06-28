import { type PropsWithChildren } from 'react';

import { cn } from '@/lib';

export interface PageProps {
  className?: string;
}

export const Page = (props: PropsWithChildren<PageProps>) => (
  <div className={cn('flex flex-1 flex-col gap-8', props.className)}>
    {props.children}
  </div>
);
