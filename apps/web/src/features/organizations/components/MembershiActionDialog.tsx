import { ConfirmDialog } from '@/components';
import { ComponentProps, useEffect, useRef, useState } from 'react';
import { getMembershipLifecycleErrorMessage } from '../services';

type Props = Omit<
  ComponentProps<typeof ConfirmDialog>,
  'onConfirm' | 'errorMessage'
> & {
  context: 'member' | 'leave';
  run: (signal: AbortSignal) => Promise<void>;
  onSuccess: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export const MembershipActionDialog = ({
  context,
  run,
  onSuccess,
  onPendingChange,
  ...dialogProps
}: Props) => {
  const [errorMessage, setErrorMessage] = useState('');
  const requestRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      requestRef.current?.abort();
    },
    [],
  );

  const confirm = async () => {
    const controller = new AbortController();
    requestRef.current = controller;

    setErrorMessage('');
    onPendingChange?.(true);

    try {
      await run(controller.signal);
      controller.signal.throwIfAborted();
    } catch (error) {
      if (!controller.signal.aborted) {
        setErrorMessage(getMembershipLifecycleErrorMessage(error, context));
      }
      throw error;
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }

      if (!controller.signal.aborted) {
        onPendingChange?.(false);
      }
    }

    onSuccess();
  };

  return (
    <ConfirmDialog
      {...dialogProps}
      errorMessage={errorMessage}
      onConfirm={confirm}
    />
  );
};
