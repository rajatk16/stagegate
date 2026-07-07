import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useOrganizations } from './queries';
import { ORGANIZATION_ROUTES } from '../constants';
import { useSetCurrentOrganization } from './useCurrentOrganization';

export const useSyncOrganization = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const { data: organizations, isSuccess } = useOrganizations();

  const setCurrentOrganization = useSetCurrentOrganization();

  useEffect(() => {
    if (!isSuccess) return;

    if (!slug) return;

    const organization = organizations?.find(
      (organization) => organization.slug === slug,
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
  }, [slug, organizations, isSuccess, navigate, setCurrentOrganization]);

  const organization = useMemo(() => {
    if (!organizations || !slug) {
      return null;
    }

    return (
      organizations.find((organization) => organization.slug === slug) ?? null
    );
  }, [organizations, slug]);

  const isSynced = useMemo(() => {
    if (!slug) return true;

    if (!isSuccess) return false;

    return organization !== null;
  }, [isSuccess, organization, slug]);

  return {
    organization,
    isSynced,
  };
};
