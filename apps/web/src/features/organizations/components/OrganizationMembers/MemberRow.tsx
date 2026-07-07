import { TableCell, TableRow } from '@/components/ui';

import { MemberAvatar } from './MemberAvatar';
import { MemberActions } from './MemberActions';
import { MemberRoleBadge } from './MemberRoleBadge';
import { CurrentUserBadge } from './CurrentUserBadge';
import type { OrganizationMember } from '../../types';

interface MemberRowProps {
  member: OrganizationMember;
  canManageMembers: boolean;
  currentMember: OrganizationMember;
  onEditRole?: (member: OrganizationMember) => void;
  onRemoveMember?: (member: OrganizationMember) => void;
}

const formatJoinedAt = (joinedAt: OrganizationMember['joinedAt']) => {
  if (joinedAt instanceof Date) {
    return joinedAt.toLocaleDateString();
  }

  if (typeof joinedAt === 'string') {
    return new Date(joinedAt).toLocaleDateString();
  }

  const seconds = joinedAt.seconds ?? joinedAt._seconds;

  if (seconds) {
    return new Date(seconds * 1000).toLocaleDateString();
  }

  return 'Unknown';
};

export const MemberRow = ({
  member,
  onEditRole,
  currentMember,
  onRemoveMember,
  canManageMembers,
}: MemberRowProps) => (
  <TableRow className="transition-colors duration-200 hover:bg-muted/50">
    <TableCell>
      <MemberAvatar
        displayName={member.displayName}
        photoUrl={member.avatarUrl}
      />
    </TableCell>

    <TableCell className="font-medium">
      {member.displayName}
      {member.id === currentMember.id && <CurrentUserBadge />}
    </TableCell>

    <TableCell>{member.email}</TableCell>

    <TableCell>
      <MemberRoleBadge role={member.roles[0]} />
    </TableCell>

    <TableCell>{formatJoinedAt(member.joinedAt)}</TableCell>

    <TableCell className="w-16">
      <MemberActions
        member={member}
        onEditRole={onEditRole}
        currentMember={currentMember}
        onRemoveMember={onRemoveMember}
        canManageMembers={canManageMembers}
      />
    </TableCell>
  </TableRow>
);
