import type { PropsWithChildren, ReactNode } from 'react';

import { cn } from '@/lib';

import { Dialog, DialogContent } from '../ui';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const Modal = (props: PropsWithChildren<ModalProps>) => (
  <Dialog open={props.open} onOpenChange={props.onOpenChange}>
    <DialogContent className={cn('sm:max-w-2xl', props.className)}>
      {props.header}
      {props.children}
      {props.footer}
    </DialogContent>
  </Dialog>
);
