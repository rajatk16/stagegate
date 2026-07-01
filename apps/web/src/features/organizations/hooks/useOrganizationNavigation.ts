import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ORGANIZATION_ROUTES } from '../constants';

export const useOrganizationNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const switchOrganization = useCallback(
    (organizationSlug: string) => {
      const segments = location.pathname.split('/');

      const organizationIndex = segments.indexOf('organizations');

      if (organizationIndex >= 0 && segments.length > organizationIndex + 1) {
        segments[organizationIndex + 1] = organizationSlug;

        navigate(segments.join('/'));

        return;
      }

      navigate(ORGANIZATION_ROUTES.DETAIL(organizationSlug));
    },
    [location.pathname, navigate],
  );

  return {
    switchOrganization,
  };
};
