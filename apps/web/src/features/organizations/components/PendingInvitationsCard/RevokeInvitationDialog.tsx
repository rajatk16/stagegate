import { ConfirmationDialog } from '@/components/dialogs';

import type { OrganizationInvitation } from '../../types';

interface RevokeInvitationDialogProps {
  open: boolean;
  isLoading?: boolean;
  invitation: OrganizationInvitation | null;

  onConfirm: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export const RevokeInvitationDialog = ({
  isLoading = false,
  ...props
}: RevokeInvitationDialogProps) => {
  const description = props.invitation ? (
    <>
      Are you sure you want to revoke the invitation sent to{' '}
      <strong>{props.invitation.email}</strong>?
      <br />
      <br />
      They will no longer be able to join this organization using this
      invitation.
    </>
  ) : (
    'Are you sure you want to revoke this invitation?'
  );
  return (
    <ConfirmationDialog
      open={props.open}
      loading={isLoading}
      title="Revoke Invitation"
      description={description}
      onConfirm={props.onConfirm}
      confirmLabel="Revoke Invitation"
      onOpenChange={props.onOpenChange}
    />
  );
};
