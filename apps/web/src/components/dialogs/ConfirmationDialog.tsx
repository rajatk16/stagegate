import { Loader2, TriangleAlert } from 'lucide-react';
import {
  useMemo,
  useState,
  type ReactNode,
  type ComponentProps,
  type PropsWithChildren,
} from 'react';

import {
  Input,
  AlertDialog,
  type Button,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '../ui';

export interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  icon?: ReactNode;
  danger?: boolean;
  loading?: boolean;
  children?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  description: ReactNode;
  confirmationPhrase?: string;
  confirmationPlaceholder?: string;
  confirmationDescription?: ReactNode;
  confirmSize?: ComponentProps<typeof Button>['size'];
  confirmVariant?: ComponentProps<typeof Button>['variant'];

  onConfirm(): void | Promise<void>;
  onOpenChange(open: boolean): void;
}

export const ConfirmationDialog = ({
  danger = true,
  loading = false,
  cancelLabel = 'Cancel',
  confirmSize = 'default',
  confirmLabel = 'Confirm',
  ...props
}: PropsWithChildren<ConfirmationDialogProps>) => {
  return (
    <AlertDialog
      open={props.open}
      onOpenChange={(nextOpen) => {
        if (!loading) {
          props.onOpenChange(nextOpen);
        }
      }}
    >
      {props.open && (
        <ConfirmationDialogContent
          {...props}
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          confirmSize={confirmSize}
          danger={danger}
          loading={loading}
        />
      )}
    </AlertDialog>
  );
};

const ConfirmationDialogContent = ({
  danger,
  loading,
  cancelLabel,
  confirmSize,
  confirmLabel,
  ...props
}: PropsWithChildren<
  Required<Pick<ConfirmationDialogProps, 'danger' | 'loading'>> &
    Pick<
      ConfirmationDialogProps,
      | 'cancelLabel'
      | 'confirmLabel'
      | 'confirmSize'
      | 'confirmVariant'
      | 'confirmationDescription'
      | 'confirmationPhrase'
      | 'description'
      | 'icon'
      | 'onConfirm'
      | 'title'
    >
>) => {
  const [confirmationValue, setConfirmationValue] = useState('');

  const confirmationSatisfied = useMemo(() => {
    if (!props.confirmationPhrase) {
      return true;
    }

    return confirmationValue.trim() === props.confirmationPhrase;
  }, [confirmationValue, props.confirmationPhrase]);

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogMedia>
          {props.icon ?? <TriangleAlert className="size-8 text-destructive" />}
        </AlertDialogMedia>
        <AlertDialogTitle>{props.title}</AlertDialogTitle>
        <AlertDialogDescription>{props.description}</AlertDialogDescription>
        {props.confirmationPhrase && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              {props.confirmationDescription ?? (
                <>
                  Type <strong>{props.confirmationPhrase}</strong> to continue.
                </>
              )}
            </p>
            <Input
              autoComplete="off"
              spellCheck={false}
              value={confirmationValue}
              onChange={(event) => setConfirmationValue(event.target.value)}
            />
          </div>
        )}
      </AlertDialogHeader>

      {props.children}

      <AlertDialogFooter>
        <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
        <AlertDialogAction
          disabled={loading || !confirmationSatisfied}
          variant={props.confirmVariant ?? (danger ? 'destructive' : 'default')}
          size={confirmSize}
          onClick={(event) => {
            event.preventDefault();
            void props.onConfirm();
          }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Working...
            </>
          ) : (
            confirmLabel
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};
