import { User } from 'firebase/auth';

import { Button, InlineAlert } from '@/components';
import { isAccessError, useEventQuery } from '@/app/query';
import { Organization, useOrganizations } from '@/features/organizations';

import { getEventSettingsError } from '../utils';
import { EventSettingsForm } from './EventSettingsForm';

type Props = {
  user: User;
  organization: Organization;
  eventId: string;
};

export const EventSettingsContent = ({
  user,
  organization,
  eventId,
}: Props) => {
  const query = useEventQuery(user, organization.id, eventId);
  const { reload } = useOrganizations();

  if (isAccessError(query.error)) {
    return (
      <div className="space-y-4">
        <InlineAlert tone="error" title="Event unavailable">
          {getEventSettingsError(query.error, 'load')}
        </InlineAlert>

        <Button type="button" variant="outline" onClick={reload}>
          Refresh access
        </Button>
      </div>
    );
  }

  if (query.isPending) {
    return (
      <p role="status" className="text-muted-foreground">
        Loading event settings…
      </p>
    );
  }

  const event = query.data;

  if (!event) {
    return (
      <div className="space-y-4">
        <InlineAlert tone="error" title="Could not load event settings">
          {getEventSettingsError(query.error, 'load')}
        </InlineAlert>

        <Button
          type="button"
          variant="outline"
          disabled={query.isFetching}
          onClick={() => {
            void query.refetch();
          }}
        >
          {query.isFetching ? 'Loading…' : 'Try again'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {query.error && (
        <InlineAlert tone="warning" title="Could not refresh settings">
          Your current form has been preserved. Reload saved settings when you
          are ready to replace your draft.
        </InlineAlert>
      )}

      <EventSettingsForm
        key={`${user.uid}:${organization.id}:${event.id}`}
        user={user}
        organization={organization}
        event={event}
        onReload={async () => {
          const result = await query.refetch();

          if (result.error) {
            throw result.error;
          }

          if (!result.data) {
            throw new Error('The event settings response was empty.');
          }

          return result.data;
        }}
      />
    </div>
  );
};
