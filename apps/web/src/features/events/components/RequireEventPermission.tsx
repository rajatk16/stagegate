import { Outlet } from 'react-router';

import { InlineAlert } from '@/components';

import { EventPermission } from '../types';
import { useEventWorkspace } from '../hooks';
import { hasEventPermission } from '../utils';

export const RequireEventPermission = ({
  permission,
}: {
  permission: EventPermission;
}) => {
  const { access } = useEventWorkspace();

  if (!hasEventPermission(access, permission)) {
    return (
      <InlineAlert tone="warning" title="Access unavailable">
        Your event permissions do not include this operation.
      </InlineAlert>
    );
  }

  return <Outlet />;
};
