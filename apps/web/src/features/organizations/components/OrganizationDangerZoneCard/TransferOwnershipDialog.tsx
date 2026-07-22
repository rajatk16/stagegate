import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '@/components/ui';

import type { OrganizationMember } from '../../types';
import { TransferOwnershipWizard } from './TransferOwnershipWizard';

export interface TransferOwnershipDialogProps {
  open: boolean;
  loading?: boolean;
  members: OrganizationMember[];
  currentOwner: OrganizationMember;
  onOpenChange: (open: boolean) => void;
}

export const TransferOwnershipDialog = (
  props: TransferOwnershipDialogProps,
) => {
  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Transfer Ownership</AlertDialogTitle>
          <AlertDialogDescription>
            Transfer ownership of the organization to another member.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-8 text-center text-muted-foreground">
          <TransferOwnershipWizard
            members={props.members}
            loading={props.loading}
            currentOwner={props.currentOwner}
            onCancel={() => props.onOpenChange(false)}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
