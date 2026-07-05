import { TableCell, TableRow } from '@/components/ui';

import { MemberAvatar } from './MemberAvatar';
import type { OrganizationMember } from '../../types';
import { MemberRoleBadges } from './MemberRoleBadges';

interface MemberRowProps {
  member: OrganizationMember;
}

export const MemberRow = ({ member }: MemberRowProps) => (
  <TableRow>
    <TableCell>
      <MemberAvatar
        displayName={member.displayName}
        photoUrl={member.avatarUrl}
      />
    </TableCell>

    <TableCell className="font-medium">{member.displayName}</TableCell>

    <TableCell>{member.email}</TableCell>

    <TableCell>
      <MemberRoleBadges roles={member.roles} />
    </TableCell>

    <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
  </TableRow>
);
