import { useConfirmationDialog } from '@/app';
import {
  Card,
  Button,
  CardTitle,
  CardHeader,
  CardContent,
} from '@/components/ui';

import { useArchiveOrganization } from '../../hooks';
import { TransferOwnershipDialog } from './TransferOwnershipDialog';
import { ArchiveOrganizationDialog } from './ArchiveOrganizationDialog';
import {
  OrganizationStatus,
  type OrganizationMember,
  type OrganizationDetails,
} from '../../types';

interface Props {
  isLoadingMembers: boolean;
  canTransferOwnership: boolean;
  members: OrganizationMember[];
  canArchiveOrganization: boolean;
  currentOwner: OrganizationMember;
  organization: OrganizationDetails;
}

export const OrganizationDangerZoneCard = ({
  members,
  currentOwner,
  organization,
  isLoadingMembers,
  canTransferOwnership,
  canArchiveOrganization,
}: Props) => {
  const transferOwnershipDialog = useConfirmationDialog<null>();
  const archiveOrganizationDialog = useConfirmationDialog<null>();
  const { archiveOrganization, isPending } = useArchiveOrganization();

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>

        <CardContent className="space-y-10">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Archive this organization. It can be restored later.
            </p>
            <Button
              variant="destructive"
              disabled={
                organization.status !== OrganizationStatus.ACTIVE &&
                !canArchiveOrganization
              }
              onClick={() => archiveOrganizationDialog.show(null)}
            >
              Archive Organization
            </Button>
          </div>

          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Transfer ownership of the organization to another member.
            </p>
            <Button
              variant="destructive"
              disabled={
                organization.status !== OrganizationStatus.ACTIVE &&
                !canTransferOwnership
              }
              onClick={() => transferOwnershipDialog.show(null)}
            >
              Transfer Ownership
            </Button>
          </div>
        </CardContent>
      </Card>

      <ArchiveOrganizationDialog
        open={archiveOrganizationDialog.open}
        isArchiving={isPending}
        onCancel={() => archiveOrganizationDialog.close()}
        organizationName={organization.name}
        onConfirm={() =>
          archiveOrganization({ organizationSlug: organization.slug })
        }
      />

      <TransferOwnershipDialog
        open={transferOwnershipDialog.open}
        members={members}
        loading={isLoadingMembers}
        currentOwner={currentOwner!}
        onOpenChange={(open) => {
          if (!open) {
            transferOwnershipDialog.close();
          }
        }}
      />
    </>
  );
};
