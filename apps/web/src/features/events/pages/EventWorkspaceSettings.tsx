import { InlineAlert } from '@/components';

import { useEventWorkspace } from '../hooks';
import { EventSettingsForm } from '../components';

export const EventWorkspaceSettings = () => {
  const {
    user,
    event,
    reloadEvent,
    capabilities,
    refreshAccess,
    organizationId,
  } = useEventWorkspace();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Event Settings</h2>

      {event.status === 'ARCHIVED' && (
        <InlineAlert tone="info">
          Archived event settings cannot be edited.
        </InlineAlert>
      )}

      <EventSettingsForm
        user={user}
        event={event}
        onReload={reloadEvent}
        onRefreshAccess={refreshAccess}
        organizationId={organizationId}
        canEdit={capabilities.canEditSettings}
        key={`${user.uid}:${organizationId}:${event.id}`}
      />
    </div>
  );
};
