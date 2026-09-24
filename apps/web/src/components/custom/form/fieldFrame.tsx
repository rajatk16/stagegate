import { useId } from "react";

import { FieldFrameProps } from "./types";

export const FieldFrame = (props: FieldFrameProps) => {
  const generatedId = useId();
  const fieldId = props.id ?? generatedId;

  const descriptionIds = [
    props.describedBy,
    props.hint ? `${fieldId}-hint` : undefined,
    props.error ? `${fieldId}-error` : undefined
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {props.label}
      </label>

      {props.children({
        id: fieldId,
        "aria-invalid": Boolean(props.error),
        "aria-describedby": descriptionIds
      })}

      {props.hint && (
        <p
          id={`${fieldId}-hint`}
          className="text-xs text-muted-foreground"
        >
          {props.hint}
        </p>
      )}
    </div>
  );
};