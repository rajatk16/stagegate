import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui";

import { SubmitButtonProps } from "./types";

export const SubmitButton = (props: SubmitButtonProps) => (
  <Button
    {...props}
    type="submit"
    disabled={props.pending || props.disabled}
    aria-busy={props.pending}
  >
    {props.pending && (
      <LoaderCircle 
        aria-hidden="true"
        className="size-4 motion-safe:animate-spin"
      />
    )}
    {props.pending ? props.pendingLabel : props.children}
  </Button>
);
