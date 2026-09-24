import { AlertDialog } from "radix-ui";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";

import { InlineAlert } from "../alerts";

type ConfirmDialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  errorMessage?: string;
  destructive?: boolean;
  disabled?: boolean;
  restoreFocus?: () => void;
  onConfirm: () => void | Promise<void>;
}

export const ConfirmDialog = ({
  triggerLabel,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  pendingLabel = "Working...",
  errorMessage = "The action could not be complete. Please try again.",
  destructive = false,
  disabled = false,
  onConfirm,
  restoreFocus
}: ConfirmDialogProps) => {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const lock = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    }
  }, []);

  const confirm = async () => {
    if (lock.current || disabled) return;

    lock.current = true;
    setPending(true);
    setFailed(false);

    try {
      await onConfirm();

      if (mounted.current) {
        setOpen(false);
      }
    } catch {
      if (mounted.current) {
        setFailed(true);
      }
    } finally {
      lock.current = false;

      if (mounted.current) {
        setPending(false);
      }
    }
  };

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (lock.current || (nextOpen && disabled)) return;

        setFailed(false);
        setOpen(nextOpen);
      }}
    >
      <AlertDialog.Trigger asChild>
        <Button
          type="button" variant="outline" disabled={disabled}
        >
          {triggerLabel}
        </Button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50">
          <AlertDialog.Content
            aria-busy={pending}
            className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-background p-6 text-foreground shadow-xl"
            onEscapeKeyDown={(event) => {
              if (lock.current) event.preventDefault();
            }}
            onCloseAutoFocus={(event) => {
              if (restoreFocus) {
                event.preventDefault();
                restoreFocus();
              }
            }}
          >
            <AlertDialog.Title className="text-lg font-semibold">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
              {description}
            </AlertDialog.Description>
            {failed && (
              <InlineAlert tone="error" className="mt-4">
                {errorMessage}
              </InlineAlert>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button type="button" variant="outline" disabled={pending}>
                  {cancelLabel}
                </Button>
              </AlertDialog.Cancel>

              <Button 
                type="button"
                variant={destructive ? "destructive" : "default"}
                aria-disabled={pending}
                className="aria-disabled:cursor-wait aria-disabled:opacity-60"
                onClick={() => void confirm()}
              >
                {pending && (
                  <LoaderCircle 
                    aria-hidden="true"
                    className="size-4 motion-safe:animate-spin"
                  />
                )}
                {pending ? pendingLabel : confirmLabel}
              </Button>
            </div>
            <p role="status" className="sr-only">
              {pending ? pendingLabel : ""}
            </p>
          </AlertDialog.Content>
        </AlertDialog.Overlay>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}