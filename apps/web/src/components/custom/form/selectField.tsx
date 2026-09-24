import { cn } from "cn";

import { FieldFrame } from "./fieldFrame";
import { controlStyles, SelectFieldProps } from "./types";

export const SelectField = (props: SelectFieldProps) => (
  <FieldFrame
    id={props.id}
    label={props.label}
    hint={props.hint}
    error={props.error}
    describedBy={props["aria-describedby"]}
  >
    {(accessibility) => (
      <select
        {...props}
        {...accessibility}
        className={cn(controlStyles, "h-11", props.className)}
      >
        {props.className}
      </select>
    )}
  </FieldFrame>
);
