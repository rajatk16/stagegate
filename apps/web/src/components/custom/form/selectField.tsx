import { cn } from 'cn';
import { ComponentProps } from 'react';

import { FieldFrame } from './FieldFrame';

type FieldDetails = {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
};

const controlStyles =
  'w-full min-w-0 rounded-2xl border border-input bg-background ' +
  'px-3 py-2 text-base text-foreground shadow-sm outline-none md:text-sm ' +
  'placeholder:text-muted-foreground ' +
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 ' +
  'aria-invalid:border-destructive ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

type SelectFieldProps = FieldDetails &
  Omit<ComponentProps<'select'>, 'id' | 'aria-invalid'>;

export const SelectField = (props: SelectFieldProps) => (
  <FieldFrame
    id={props.id}
    label={props.label}
    hint={props.hint}
    error={props.error}
    describedBy={props['aria-describedby']}
  >
    {(accessibility) => (
      <select
        {...props}
        {...accessibility}
        className={cn(controlStyles, 'h-11', props.className)}
      >
        {props.children}
      </select>
    )}
  </FieldFrame>
);
