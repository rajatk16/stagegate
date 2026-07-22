import { ConfirmationDialog } from '@/components/dialogs';
import { LogOut } from 'lucide-react';

interface LeaveOrganizationDialogProps {
  open: boolean;
  isLeaving?: boolean;
  organizationName: string;

  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export const LeaveOrganizationDialog = ({
  isLeaving = false,
  ...props
}: LeaveOrganizationDialogProps) => {
  const description = (
    <>
      You are about to leave <strong>{props.organizationName}</strong>.
      <br />
      <br />
      You will immediately lose access to this organization.
      <br />
      <br />
      An admin will need to invite you again if you wish to rejoin in the
      future.
    </>
  );

  return (
    <ConfirmationDialog
      open={props.open}
      loading={isLeaving}
      description={description}
      onConfirm={props.onConfirm}
      title="Leave Organization?"
      confirmLabel="Leave Organization"
      onOpenChange={props.onOpenChange}
      icon={<LogOut className="size-8 text-destructive" />}
    />
  );
};
