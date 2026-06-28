import { useMemo } from 'react';

import { buildNavigation } from '@/components/navigation';

export const useNavigation = () => {
  /**
   * Eventually:
   * const { organizationSlug } = useOrganization()
   */

  const organizationSlug = undefined;

  return useMemo(
    () => buildNavigation({ organizationSlug }),
    [organizationSlug],
  );
};
