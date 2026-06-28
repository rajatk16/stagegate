import { Trash2 } from 'lucide-react';

import { ConfirmActionDialog } from './ConfirmActionDialog';

interface DeleteResourceDialogProps {
  open: boolean;
  resourceName: string;
  isPending?: boolean;
  onOpenChange(open: boolean): void;
  onDelete(): void | Promise<void>;
}

export const DeleteResourceDialog = ({
  open,
  resourceName,
  isPending,
  onOpenChange,
  onDelete,
}: DeleteResourceDialogProps) => (
  <ConfirmActionDialog
    open={open}
    onConfirm={onDelete}
    confirmLabel="Delete"
    isPending={isPending}
    variant="destructive"
    onOpenChange={onOpenChange}
    title={`Delete ${resourceName}`}
    icon={<Trash2 className="mb-2 h-8 w-8 text-destructive" />}
    description={`This action cannot be undone. This will permanently delete the ${resourceName}.`}
  />
);
