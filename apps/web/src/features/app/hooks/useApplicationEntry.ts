import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useOrganizations,
  ORGANIZATION_ROUTES,
  useCurrentOrganizationSlug,
} from '@/features/organizations';

export const useApplicationEntry = () => {
  const navigate = useNavigate();
  const currentOrganizationSlug = useCurrentOrganizationSlug();

  const {
    data: organizations = [],
    isLoading,
    isError,
    error,
  } = useOrganizations();

  useEffect(() => {
    if (isLoading || isError) return;
    if (organizations.length === 0) {
      navigate(ORGANIZATION_ROUTES.CREATE, { replace: true });
      return;
    }

    const currentOrganization = organizations.find(
      (organization) => organization.slug === currentOrganizationSlug,
    );

    const redirectTo = ORGANIZATION_ROUTES.DASHBOARD(
      currentOrganization?.slug ?? organizations[0].slug,
    );

    navigate(redirectTo, {
      replace: true,
    });
  }, [currentOrganizationSlug, isError, isLoading, navigate, organizations]);

  return {
    error,
    isError,
  };
};
