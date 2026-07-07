import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui';

import { MemberRoleSelect } from './MemberRoleSelect';
import { OrganizationRole, type OrganizationMember } from '../../types';

interface EditMemberRoleDialogProps {
  open: boolean;
  isSubmitting: boolean;
  member: OrganizationMember | null;
  currentMemberId: string;

  onClose: () => void;
  onSave: (role: OrganizationRole) => Promise<void>;
}

export const EditMemberRoleDialog = (props: EditMemberRoleDialogProps) => {
  const isCurrentUser = props.currentMemberId === props.member?.id;
  const [role, setRole] = useState<OrganizationRole>(
    props.member?.roles[0] ?? OrganizationRole.MEMBER,
  );

  if (!props.member) {
    return null;
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Member Role</DialogTitle>
          <DialogDescription>
            Update the role for <strong>{props.member.displayName}</strong>
          </DialogDescription>
        </DialogHeader>

        <MemberRoleSelect
          value={role}
          onChange={setRole}
          disabled={props.isSubmitting || isCurrentUser}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={props.onClose}
            disabled={props.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            disabled={
              props.isSubmitting ||
              isCurrentUser ||
              props.member.roles.includes(role)
            }
            onClick={() => props.onSave(role)}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
