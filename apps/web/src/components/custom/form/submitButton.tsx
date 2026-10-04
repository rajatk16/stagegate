import { ComponentProps } from 'react';
import { LoaderCircle } from 'lucide-react';

import { Button } from '@/components';

export type SubmitButtonProps = Omit<
  ComponentProps<typeof Button>,
  'type' | 'asChild'
> & {
  pending: boolean;
  pendingLabel?: string;
};

export const SubmitButton = (props: SubmitButtonProps) => (
  <Button
    {...props}
    type="submit"
    disabled={props.pending || props.disabled}
    aria-busy={props.pending}
  >
    {props.pending && (
      <LoaderCircle
        aria-hidden="true"
        className="size-4 motion-safe:animate-spin"
      />
    )}
    {props.pending ? props.pendingLabel : props.children}
  </Button>
);
