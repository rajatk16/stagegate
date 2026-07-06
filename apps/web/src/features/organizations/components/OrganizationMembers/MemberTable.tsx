import { ErrorState } from '@/components/states';
import { TableSkeleton } from '@/components/feedback';
import {
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableHeader,
} from '@/components/ui';

import { MemberRow } from './MemberRow';
import type { OrganizationMember } from '../../types';

interface MembersTableProps {
  members: OrganizationMember[];
  isLoading?: boolean;
  isError: boolean;
  error: Error | null;
}

export const MembersTable = (props: MembersTableProps) => {
  if (props.isLoading) {
    return <TableSkeleton />;
  }

  if (props.isError) {
    return (
      <ErrorState
        title="Failed to load members"
        description="Please try again later"
        onRetry={() => {
          window.location.reload();
        }}
      />
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16" />
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.members.map((member) => (
          <MemberRow key={member.id} member={member} />
        ))}
      </TableBody>
    </Table>
  );
};
