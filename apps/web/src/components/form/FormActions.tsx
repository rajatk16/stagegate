import type { PropsWithChildren } from 'react';

import { cn } from '@/lib';

interface FormActionsProps {
  className?: string;
}

export const FormActions = (props: PropsWithChildren<FormActionsProps>) => (
  <div
    className={cn('flex items-center justify-end gap-2 pt-6', props.className)}
  >
    {props.children}
  </div>
);
