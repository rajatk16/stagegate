import { Loader2 } from 'lucide-react';
import type { ComponentProps, PropsWithChildren } from 'react';

import { Button } from '../ui';

interface SubmitButtonProps extends Omit<
  ComponentProps<typeof Button>,
  'type'
> {
  loading?: boolean;
  loadingText?: string;
}

export const SubmitButton = ({
  loading = false,
  ...props
}: PropsWithChildren<SubmitButtonProps>) => (
  <Button type="submit" disabled={props.disabled || loading}>
    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    {loading ? (props.loadingText ?? props.children) : props.children}
  </Button>
);
