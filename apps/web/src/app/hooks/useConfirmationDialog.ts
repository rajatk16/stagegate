import { useCallback, useState } from 'react';

export interface ConfirmationDialogState<T> {
  open: boolean;
  item: T | null;
}

export interface UseConfirmationDialogReturn<T> {
  open: boolean;
  item: T | null;

  clear: () => void;
  close: () => void;
  show: (item: T) => void;
  setOpen: (open: boolean) => void;
  setItem: (item: T | null) => void;
}

export const useConfirmationDialog = <T>(): UseConfirmationDialogReturn<T> => {
  const [state, setState] = useState<ConfirmationDialogState<T>>({
    item: null,
    open: false,
  });

  const show = useCallback((item: T) => {
    setState({
      open: true,
      item,
    });
  }, []);

  const close = useCallback(() => {
    setState({
      item: null,
      open: false,
    });
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setState((previous) => ({
      open,
      item: open ? previous.item : null,
    }));
  }, []);

  const clear = useCallback(() => {
    setState((previous) => ({
      ...previous,
      item: null,
    }));
  }, []);

  const setItem = useCallback((item: T | null) => {
    setState((previous) => ({
      ...previous,
      item,
    }));
  }, []);

  return {
    open: state.open,
    item: state.item,
    show,
    close,
    setOpen,
    clear,
    setItem,
  };
};
