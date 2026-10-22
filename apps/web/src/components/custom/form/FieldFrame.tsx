import { ReactNode, useId } from 'react';

type FieldDetails = {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
};

type AccessibilityProps = {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
};

type FieldFrameProps = FieldDetails & {
  describedBy?: string;
  children: (props: AccessibilityProps) => ReactNode;
};

export const FieldFrame = (props: FieldFrameProps) => {
  const generatedId = useId();
  const fieldId = props.id ?? generatedId;

  const descriptionIds =
    [
      props.describedBy,
      props.hint ? `${fieldId}-hint` : undefined,
      props.error ? `${fieldId}-error` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {props.label}
      </label>

      {props.children({
        id: fieldId,
        'aria-invalid': Boolean(props.error),
        'aria-describedby': descriptionIds,
      })}

      {props.hint && (
        <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
          {props.hint}
        </p>
      )}
      {props.error && (
        <p
          id={`${fieldId}-error`}
          role="alert"
          className="text-sm text-destructive"
        >
          {props.error}
        </p>
      )}
    </div>
  );
};
