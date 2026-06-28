import type { ReactNode } from 'react';

import { DialogDescription, DialogHeader, DialogTitle } from '../ui';

interface ModalHeaderProps {
  title: string;
  icon?: ReactNode;
  description?: string;
}

export const ModalHeader = (props: ModalHeaderProps) => {
  return (
    <DialogHeader>
      {props.icon}
      <DialogTitle>{props.title}</DialogTitle>
      {props.description && (
        <DialogDescription>{props.description}</DialogDescription>
      )}
    </DialogHeader>
  );
};
