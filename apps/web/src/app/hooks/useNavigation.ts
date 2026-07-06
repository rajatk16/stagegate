import { useMemo } from 'react';

import { buildNavigation } from '@/components/navigation';

export const useNavigation = (organizationSlug?: string) =>
  useMemo(() => buildNavigation({ organizationSlug }), [organizationSlug]);
