import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui';

import { InviteMemberForm } from './InviteMemberForm';
import type { InviteMemberFormSchema } from './schema';

interface InviteMemberDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: InviteMemberFormSchema) => Promise<void>;
}

export const InviteMemberDialog = (props: InviteMemberDialogProps) => {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Invite someone to join this organization.
          </DialogDescription>
        </DialogHeader>

        <InviteMemberForm
          onSubmit={props.onSubmit}
          isSubmitting={props.isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};
