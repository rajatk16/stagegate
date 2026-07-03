import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useOrganizations } from './queries';
import { ORGANIZATION_ROUTES } from '../constants';
import { useSetCurrentOrganization } from './useCurrentOrganization';

export const useSyncOrganization = () => {
  const navigate = useNavigate();
  const { organizationSlug } = useParams<{ organizationSlug: string }>();

  const { data: organizations, isSuccess } = useOrganizations();

  const setCurrentOrganization = useSetCurrentOrganization();

  useEffect(() => {
    if (!isSuccess) return;

    if (!organizationSlug) return;

    const organization = organizations?.find(
      (organization) => organization.slug === organizationSlug,
    );

    if (organizations?.length === 0) {
      navigate(ORGANIZATION_ROUTES.CREATE, { replace: true });
      return;
    }

    if (!organization) {
      navigate(ORGANIZATION_ROUTES.DASHBOARD(organizations[0].slug), {
        replace: true,
      });
      return;
    }
    setCurrentOrganization(organization);
  }, [
    organizationSlug,
    organizations,
    isSuccess,
    navigate,
    setCurrentOrganization,
  ]);

  const organization = useMemo(() => {
    if (!organizations || !organizationSlug) {
      return null;
    }

    return (
      organizations.find(
        (organization) => organization.slug === organizationSlug,
      ) ?? null
    );
  }, [organizations, organizationSlug]);

  const isSynced = useMemo(() => {
    if (!organizationSlug) return true;

    if (!isSuccess) return false;

    return organization !== null;
  }, [isSuccess, organization, organizationSlug]);

  return {
    organization,
    isSynced,
  };
};
