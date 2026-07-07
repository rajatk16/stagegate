import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '@/components/ui';

import type { OrganizationMember } from '../../types';

interface RemoveMemberDialogProps {
  open: boolean;
  isRemoving: boolean;
  member: OrganizationMember | null;

  onClose: () => void;
  onConfirm: () => void;
}

export const RemoveMemberDialog = (props: RemoveMemberDialogProps) => {
  if (props.member === null) return null;

  return (
    <AlertDialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) {
          props.onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Member?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove <strong>{props.member.displayName}</strong> from
            the organization.
            <br />
            <br />
            This action cannot be undone. You will need to add them back to the
            organization.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={props.isRemoving}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={props.isRemoving}
            onClick={props.onConfirm}
          >
            {props.isRemoving ? 'Removing...' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
