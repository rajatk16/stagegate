import { TableCell, TableRow } from '@/components/ui';

import { MemberRoleBadge } from '../OrganizationMembers';
import { InvitationStatusBadge } from './InvitationStatusBadge';
import { PendingInvitationActions } from './PendingInvitationActions';
import type {
  FirebaseTimestampLike,
  OrganizationInvitation,
} from '../../types';

interface Props {
  invitation: OrganizationInvitation;
  onRevoke: (invitation: OrganizationInvitation) => void;
}

const formatTimestamp = (timestamp: FirebaseTimestampLike) => {
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString();
  }

  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleDateString();
  }

  const seconds = timestamp.seconds ?? timestamp._seconds;

  if (seconds) {
    return new Date(seconds * 1000).toLocaleDateString();
  }

  return 'Unknown';
};

export const PendingInvitationRow = (props: Props) => (
  <TableRow className="transition-colors duration-200 hover:bg-muted/50">
    <TableCell className="font-medium">{props.invitation.email}</TableCell>
    <TableCell>
      <MemberRoleBadge role={props.invitation.roles[0]} />
    </TableCell>
    <TableCell>
      <InvitationStatusBadge status={props.invitation.status} />
    </TableCell>
    <TableCell>{formatTimestamp(props.invitation.createdAt)}</TableCell>
    <TableCell>{formatTimestamp(props.invitation.expiresAt)}</TableCell>
    <TableCell className="w-16">
      <PendingInvitationActions
        onRevoke={props.onRevoke}
        invitation={props.invitation}
      />
    </TableCell>
  </TableRow>
);
