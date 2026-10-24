import { Link, useParams } from 'react-router';

import { useAuth } from '@/features/auth';
import { Button, InlineAlert } from '@/components';
import { getOrganizationSectionPath } from '@/lib';
import { useActiveOrganization, UUID_PATTERN } from '@/features/organizations';

import { EventSettingsContent } from '../components/EventSettingsContent';

export const EventSettingsPage = () => {
  const session = useAuth();
  const organization = useActiveOrganization();
  const { eventId } = useParams<{ eventId: string }>();

  if (session.status !== 'authenticated') {
    return null;
  }

  const eventsPath = getOrganizationSectionPath(organization.slug, 'events');

  const validEventId =
    typeof eventId === 'string' && UUID_PATTERN.test(eventId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Event settings</h2>
        <p className="text-muted-foreground">
          Manage event details and scheduling for {organization.name}.
        </p>
      </header>

      {validEventId ? (
        <EventSettingsContent
          key={`${session.user.uid}:${organization.id}:${eventId}`}
          user={session.user}
          organization={organization}
          eventId={eventId}
        />
      ) : (
        <InlineAlert tone="error" title="Invalid event link">
          Return to Events and open the event again.
        </InlineAlert>
      )}

      <Button asChild variant="outline">
        <Link to={eventsPath}>Back to Events</Link>
      </Button>
    </div>
  );
};
