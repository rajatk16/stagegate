import { Loader2 } from 'lucide-react';
import type { PropsWithChildren } from 'react';

import { Button } from '../ui';

interface SubmitButtonProps {
  loading?: boolean;
  disabled?: boolean;
}

export const SubmitButton = (props: PropsWithChildren<SubmitButtonProps>) => (
  <Button type="submit" disabled={props.disabled || props.loading}>
    {props.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    {props.children}
  </Button>
);
