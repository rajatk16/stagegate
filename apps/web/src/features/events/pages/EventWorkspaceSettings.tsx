import { InlineAlert } from '@/components';

import { useEventWorkspace } from '../hooks';
import { hasEventPermission } from '../utils';
import { EventSettingsForm } from '../components';

export const EventWorkspaceSettings = () => {
  const { user, organizationId, event, access, reloadEvent, refreshAccess } =
    useEventWorkspace();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Event Settings</h2>

      {event.status === 'ARCHIVED' && (
        <InlineAlert tone="info">
          Archived event settings cannot be edited.
        </InlineAlert>
      )}

      <EventSettingsForm
        key={`${user.uid}:${organizationId}:${event.id}`}
        user={user}
        organizationId={organizationId}
        event={event}
        canEdit={hasEventPermission(access, 'event:update')}
        onReload={reloadEvent}
        onRefreshAccess={refreshAccess}
      />
    </div>
  );
};
