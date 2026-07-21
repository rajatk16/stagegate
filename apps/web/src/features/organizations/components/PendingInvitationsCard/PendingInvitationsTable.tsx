import {
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableHeader,
} from '@/components/ui';

import type { OrganizationInvitation } from '../../types';
import { PendingInvitationRow } from './PendingInvitationRow';

interface Props {
  invitations: OrganizationInvitation[];
  onRevoke: (invitation: OrganizationInvitation) => void;
}

export const PendingInvitationsTable = (props: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Invited</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>

      <TableBody>
        {props.invitations.map((invitation) => (
          <PendingInvitationRow
            key={invitation.id}
            invitation={invitation}
            onRevoke={props.onRevoke}
          />
        ))}
      </TableBody>
    </Table>
  );
};
