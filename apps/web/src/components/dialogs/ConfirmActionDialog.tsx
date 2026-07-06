import type { ReactNode } from 'react';

import { InlineLoader } from '../feedback';
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '../ui';

interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  icon?: ReactNode;
  description: string;
  isPending?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
  variant?: 'default' | 'destructive';

  onOpenChange: (open: boolean) => void;
  onConfirm(): void | Promise<void>;
}

export const ConfirmActionDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isPending = false,
  onOpenChange,
  onConfirm,
  icon,
}: ConfirmActionDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {icon}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();

              void onConfirm();
            }}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : undefined
            }
          >
            {isPending ? (
              <InlineLoader size="sm" text="Working..." />
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
