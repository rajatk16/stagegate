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
  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
          <AlertDialogDescription>
            {props.invitation ? (
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
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={(event) => {
              event.preventDefault();
              void props.onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Revoke Invitation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
