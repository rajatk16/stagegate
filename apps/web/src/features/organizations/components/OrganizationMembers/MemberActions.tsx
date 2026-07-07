import { MoreHorizontal } from 'lucide-react';

import {
  Button,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui';

import { OrganizationRole, type OrganizationMember } from '../../types';

interface MemberActionsProps {
  canManageMembers: boolean;
  member: OrganizationMember;
  currentMember: OrganizationMember;

  onEditRole?: (member: OrganizationMember) => void;
  onRemoveMember?: (member: OrganizationMember) => void;
}

export const MemberActions = (props: MemberActionsProps) => {
  const isCurrentUser = props.currentMember.id === props.member.id;
  const isOwner = props.member.roles.includes(OrganizationRole.OWNER);
  const canEdit = props.canManageMembers && !isCurrentUser && !isOwner;

  const canRemove = props.canManageMembers && !isCurrentUser && !isOwner;

  if (!props.canManageMembers) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={!canEdit}
          onClick={() => props.onEditRole?.(props.member)}
        >
          Edit Role
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!canRemove}
          className="text-destructive"
          onClick={() => props.onRemoveMember?.(props.member)}
        >
          Remove Member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
