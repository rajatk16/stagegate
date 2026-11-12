import type { ReactNode } from 'react';

import { InputGroup } from '../ui/inputGroup';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';

type ControlProps = {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
};

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  description?: string;
  children: (control: ControlProps) => ReactNode;
};

export const FormField = (props: FormFieldProps) => {
  const descriptionId = `${props.id}-hint`;
  const errorId = `${props.id}-error`;
  const describedBy =
    [props.description && descriptionId, props.error && errorId]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <Field data-invalid={Boolean(props.error)} className="gap-1.5">
      <FieldLabel htmlFor={props.id}>{props.label}</FieldLabel>
      <InputGroup className="min-h-11">
        {props.children({
          id: props.id,
          'aria-invalid': Boolean(props.error),
          'aria-describedby': describedBy,
        })}
      </InputGroup>
      {props.description && (
        <FieldDescription id={descriptionId}>
          {props.description}
        </FieldDescription>
      )}
      {props.error && <FieldError id={errorId}>{props.error}</FieldError>}
    </Field>
  );
};

