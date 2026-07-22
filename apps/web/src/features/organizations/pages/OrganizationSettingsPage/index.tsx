import { notificationService } from '@/lib';
import { ErrorState } from '@/components/states';
import { FullPageLoader } from '@/components/feedback';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui';

import { OrganizationRole, OrganizationStatus } from '../../types';
import {
  OrganizationForm,
  RestoreOrganizationBanner,
  OrganizationDangerZoneCard,
} from '../../components';
import {
  useOrganization,
  useUpdateOrganization,
  useCurrentOrganization,
  useOrganizationMembers,
  useRestoreOrganization,
  useOrganizationPermissions,
} from '../../hooks';

export const OrganizationSettingsPage = () => {
  const currentOrganization = useCurrentOrganization();
  const { updateOrganization, isPending } = useUpdateOrganization();
  const { restoreOrganization, isPending: isRestoring } =
    useRestoreOrganization();
  const permissions = useOrganizationPermissions(currentOrganization!.slug);
  const { data: members, isLoading: isLoadingMembers } = useOrganizationMembers(
    currentOrganization!.slug,
  );

  const currentOwner = members?.find((member) =>
    member.roles.includes(OrganizationRole.OWNER),
  );

  const { data: organization, isLoading } = useOrganization(
    currentOrganization?.slug ?? '',
  );

  if (isLoading) {
    return <FullPageLoader title="Loading organization settings..." />;
  }

  if (!organization) {
    notificationService.warning('Organization not found');
    return <ErrorState title="Organization not found" />;
  }

  if (!currentOrganization) {
    notificationService.warning('Organization not found');
    return <ErrorState title="Organization not found" />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">General Settings</h1>
        <p className="text-muted-foreground">
          Update your organization's general settings.
        </p>
      </div>
      {organization.status === OrganizationStatus.ARCHIVED &&
        permissions.canArchiveOrganization && (
          <RestoreOrganizationBanner
            isPending={isRestoring}
            onRestore={() =>
              restoreOrganization({
                organizationSlug: currentOrganization.slug,
              })
            }
          />
        )}
      {!permissions.canEditOrganization && (
        <Alert>
          <AlertTitle>Read-Only Access</AlertTitle>
          <AlertDescription>
            You do not have permission to edit this organization.
          </AlertDescription>
        </Alert>
      )}
      <OrganizationForm
        disabled={
          organization.status === OrganizationStatus.ARCHIVED ||
          !permissions.canEditOrganization
        }
        isSubmitting={isPending}
        submitLabel="Save Changes"
        defaultValues={{
          name: currentOrganization.name,
          slug: currentOrganization.slug,
          logoUrl: currentOrganization.logoUrl ?? '',
          websiteUrl: organization.websiteUrl ?? '',
          description: organization.description ?? '',
        }}
        onSubmit={async (values) => {
          await updateOrganization({
            payload: values,
            organizationSlug: currentOrganization?.slug,
          });
        }}
      />

      <OrganizationDangerZoneCard
        members={members}
        organization={organization}
        currentOwner={currentOwner}
        isLoadingMembers={isLoadingMembers}
        canArchiveOrganization={permissions.canArchiveOrganization}
        canTransferOwnership={permissions.canTransferOwnership}
      />
    </div>
  );
};
