import { cn } from 'cn';
import { ComponentProps } from 'react';

import { FieldFrame } from './FieldFrame';

const controlStyles =
  'w-full min-w-0 rounded-2xl border border-input bg-background ' +
  'px-3 py-2 text-base text-foreground shadow-sm outline-none md:text-sm ' +
  'placeholder:text-muted-foreground ' +
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 ' +
  'aria-invalid:border-destructive ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

type FieldDetails = {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
};

type TextareaFieldProps = FieldDetails &
  Omit<ComponentProps<'textarea'>, 'id' | 'aria-invalid'>;

export const TextareaField = (props: TextareaFieldProps) => (
  <FieldFrame
    id={props.id}
    label={props.label}
    hint={props.hint}
    error={props.error}
    describedBy={props['aria-describedby']}
  >
    {(accessibility) => (
      <textarea
        {...props}
        {...accessibility}
        className={cn(controlStyles, 'min-h-32 resize-y', props.className)}
      />
    )}
  </FieldFrame>
);
