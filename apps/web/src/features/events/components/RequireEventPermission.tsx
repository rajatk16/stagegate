import { Outlet } from 'react-router';

import { getEventWorkspacePath } from '@/lib';

import { useEventWorkspace } from '../hooks';
import { hasEventPermission } from '../utils';
import { EventAccessDenied } from './EventAccessDenied';
import { EVENT_SECTIONS, EventSectionKey } from '../constants';

export const RequireEventPermission = ({
  section,
}: {
  section: EventSectionKey;
}) => {
  const { access, event, organizationSlug, refreshAccess } =
    useEventWorkspace();

  const definition = EVENT_SECTIONS[section];

  if (!hasEventPermission(access, definition.permission)) {
    return (
      <EventAccessDenied
        key={section}
        onRefresh={refreshAccess}
        backLabel="Back to event overview"
        description={definition.deniedDescription}
        title={`Access denied: ${definition.label}`}
        backTo={getEventWorkspacePath(organizationSlug, event.slug)}
      />
    );
  }

  return <Outlet />;
};
