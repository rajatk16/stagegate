import type { PropsWithChildren } from 'react';

import { DialogFooter } from '../ui';

export const ModalFooter = (props: PropsWithChildren) => (
  <DialogFooter>{props.children}</DialogFooter>
);
