import type { PropsWithChildren } from 'react';

import { cn } from '@/lib';

interface FormActionsProps {
  className?: string;
}

export const FormActions = (props: PropsWithChildren<FormActionsProps>) => (
  <div
    className={cn(
      'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end',
      props.className,
    )}
  >
    {props.children}
  </div>
);
