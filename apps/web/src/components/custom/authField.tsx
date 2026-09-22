import { ComponentProps } from "react"

import { Input } from "../ui/input"

type AuthFieldProps = ComponentProps<typeof Input> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export const AuthField = ({
  id, 
  label, 
  error, 
  hint, 
  ...inputProps 
}: AuthFieldProps) => {
  const descriptionId = [
    hint ? `${id}-hint`: "",
    error ? `${id}-error` : ""
  ]
  .filter(Boolean)
  .join(" ") || undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>

      <Input 
        {...inputProps}
        id={id}
        className="h-11"
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
      />

      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
