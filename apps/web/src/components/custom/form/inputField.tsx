import { cn } from 'cn';
import { ComponentProps } from 'react';

import { Input } from '@/components';

import { FieldFrame } from './FieldFrame';

type FieldDetails = {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
};

type InputFieldProps = FieldDetails &
  Omit<ComponentProps<typeof Input>, 'id' | 'aria-invalid'>;

export const InputField = (props: InputFieldProps) => (
  <FieldFrame
    id={props.id}
    label={props.label}
    hint={props.hint}
    error={props.error}
    describedBy={props['aria-describedby']}
  >
    {(accessibility) => (
      <Input
        {...props}
        {...accessibility}
        className={cn('h-11', props.className)}
      />
    )}
  </FieldFrame>
);
