import { cn } from "cn";

import { FieldFrame } from "./fieldFrame";
import { controlStyles, TextareaFieldProps } from "./types";

export const TextareaField = (props: TextareaFieldProps) => (
  <FieldFrame
    id={props.id}
    label={props.label}
    hint={props.hint}
    error={props.error}
    describedBy={props["aria-describedby"]}
  >
    {(accessibility) => (
      <textarea 
        {...props}
        {...accessibility}
        className={cn(controlStyles, "min-h-32 resize-y", props.className)}
      />
    )}
  </FieldFrame>
);
