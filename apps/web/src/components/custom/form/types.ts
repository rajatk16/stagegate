import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { ComponentProps, ReactNode } from "react";

export type FieldDetails = {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
}

export type AccessibilityProps = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
}

export type FieldFrameProps = FieldDetails & {
  describedBy?: string;
  children: (props: AccessibilityProps) => ReactNode;
}

export type InputFieldProps = FieldDetails & Omit<ComponentProps<typeof Input>, "id" | "aria-invalid">;

export const controlStyles =
  "w-full min-w-0 rounded-2xl border border-input bg-background " +
  "px-3 py-2 text-base text-foreground shadow-sm outline-none md:text-sm " +
  "placeholder:text-muted-foreground " +
  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 " +
  "aria-invalid:border-destructive " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export type TextareaFieldProps = FieldDetails &
  Omit<ComponentProps<"textarea">, "id" | "aria-invalid">;

export type SelectFieldProps = FieldDetails &
  Omit<ComponentProps<"select">, "id" | "aria-invalid">;

export type SubmitButtonProps = Omit<
  ComponentProps<typeof Button>,
  "type" | "asChild"
> & {
  pending: boolean;
  pendingLabel?: string;
};
