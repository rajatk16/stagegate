import { Outlet } from 'react-router-dom';

import { useNavigation } from '@/app';
import { useOrganizationInitialization } from '@/features/organizations';

import { FullPageLoader } from '../feedback';
import { AppSidebar, TopNavigation } from '../navigation';

export const OrganizationLayout = () => {
  const { organization: currentOrganization, isLoading } =
    useOrganizationInitialization();

  const navigation = useNavigation(currentOrganization?.slug);

  if (isLoading || !currentOrganization) {
    return (
      <FullPageLoader
        title="Loading organization..."
        description="We're loading your organization data..."
      />
    );
  }
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar navigation={navigation} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavigation />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
