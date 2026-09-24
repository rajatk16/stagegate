import { cn } from "cn";

import { Input } from "@/components/ui";

import { FieldFrame } from "./fieldFrame";
import { InputFieldProps } from "./types";

export const InputField = (props: InputFieldProps) => (
  <FieldFrame
    id={props.id}
    label={props.label}
    hint={props.hint}
    error={props.error}
    describedBy={props["aria-describedby"]}
  >
    {(accessibility) => (
      <Input 
        {...props}
        {...accessibility}
        className={cn("h-11", props.className)}
      />
    )}
  </FieldFrame>
);
