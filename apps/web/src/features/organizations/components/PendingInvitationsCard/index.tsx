import { useState } from 'react';

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui';

import type { OrganizationInvitation } from '../../types';
import { RevokeInvitationDialog } from './RevokeInvitationDialog';
import { PendingInvitationsTable } from './PendingInvitationsTable';
import { usePendingInvitations, useRevokeInvitation } from '../../hooks';
import { PendingInvitationsSkeleton } from './PendingInvitationsSkeleton';
import { PendingInvitationsEmptyState } from './PendingInvitationsEmptyState';
import { PendingInvitationsErrorState } from './PendingInvitationsErrorState';

interface Props {
  organizationSlug: string;
}

export const PendingInvitationsCard = (props: Props) => {
  const [selectedInvitation, setSelectedInvitation] =
    useState<OrganizationInvitation | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  const {
    data: invitations = [],
    isLoading,
    isError,
    refetch,
  } = usePendingInvitations(props.organizationSlug);
  const { mutateAsync: revokeInvitation, isPending: isRevoking } =
    useRevokeInvitation();

  const handleRevoke = async (invitation: OrganizationInvitation) => {
    setSelectedInvitation(invitation);
    setRevokeDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            {invitations.length === 0
              ? 'No pending invitations found.'
              : `${invitations.length} invitation${invitations.length === 1 ? '' : 's'} awaiting response.`}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <PendingInvitationsSkeleton />
        ) : isError ? (
          <PendingInvitationsErrorState onRetry={refetch} />
        ) : invitations.length === 0 ? (
          <PendingInvitationsEmptyState />
        ) : (
          <PendingInvitationsTable
            invitations={invitations}
            onRevoke={handleRevoke}
          />
        )}
      </CardContent>

      <RevokeInvitationDialog
        open={revokeDialogOpen}
        invitation={selectedInvitation}
        isLoading={isRevoking}
        onOpenChange={(open) => {
          setRevokeDialogOpen(open);
          if (!open) {
            setSelectedInvitation(null);
          }
        }}
        onConfirm={async () => {
          if (!selectedInvitation) return;
          await revokeInvitation({
            organizationSlug: props.organizationSlug,
            invitationId: selectedInvitation.id,
          });
          setRevokeDialogOpen(false);
          setSelectedInvitation(null);
        }}
      />
    </Card>
  );
};
