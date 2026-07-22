import { ConfirmationDialog } from '@/components/dialogs';

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
    <ConfirmationDialog
      open={props.open}
      title="Remove Member?"
      description={
        <>
          Remove <strong>{props.member.displayName}</strong> from this
          organization?
          <br />
          <br />
          They will immediately lose access to this organization.
        </>
      }
      confirmLabel="Remove Member"
      loading={props.isRemoving}
      onConfirm={props.onConfirm}
      onOpenChange={(open) => {
        if (!open) {
          props.onClose();
        }
      }}
    />
  );
};
