import { notificationService } from '@/lib';

import { ErrorState } from '@/components/states';
import { FullPageLoader } from '@/components/feedback';

import { OrganizationForm } from '../../components';
import {
  useOrganization,
  useUpdateOrganization,
  useCurrentOrganization,
} from '../../hooks';

export const OrganizationSettingsPage = () => {
  const currentOrganization = useCurrentOrganization();
  const { updateOrganization, isPending } = useUpdateOrganization();

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
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">General Settings</h1>
        <p className="text-muted-foreground">
          Update your organization's general settings.
        </p>
      </div>
      <OrganizationForm
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
    </div>
  );
};
