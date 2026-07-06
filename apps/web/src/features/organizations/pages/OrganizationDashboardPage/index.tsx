import { FullPageLoader } from '@/components/feedback';

import { useOrganizationInitialization } from '../../hooks';
import { OrganizationDashboardHeader } from './OrganizationDashboardHeader';
import { OrganizationDashboardEmptyEvents } from './OrganizationDashboardEmptyEvents';
import { OrganizationDashboardQuickActions } from './OrganizationDashboardQuickActions';

export const OrganizationDashboardPage = () => {
  const { organization: currentOrganization, isLoading } =
    useOrganizationInitialization();

  if (isLoading || !currentOrganization) {
    return (
      <FullPageLoader
        title="Loading organization..."
        description="We're loading your organization data..."
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-8">
      <OrganizationDashboardHeader name={currentOrganization.name} />
      <OrganizationDashboardQuickActions slug={currentOrganization.slug} />
      <OrganizationDashboardEmptyEvents />
    </div>
  );
};
