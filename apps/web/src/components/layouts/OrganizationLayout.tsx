import { Navigate, Outlet } from 'react-router-dom';

import { useOrganizationInitialization } from '@/features/organizations';

export const OrganizationLayout = () => {
  const { isLoading, organization } = useOrganizationInitialization();

  if (isLoading) return null;

  if (!organization) {
    return <Navigate to="/organizations" replace />;
  }

  return <Outlet />;
};
