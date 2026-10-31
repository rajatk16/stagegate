import { User } from 'firebase/auth';

import { Button, InlineAlert } from '@/components';
import { EventDestination } from '@/features/events';
import { isAccessError, useMyOrganizationsQuery } from '@/app/query';

type Props = {
  user: User;
  organizationId: string;
  eventId: string;
};

export const EventInvitationDestination = ({
  user,
  organizationId,
  eventId,
}: Props) => {
  const query = useMyOrganizationsQuery(user);

  if (query.isPending) {
    return <p role="status">Checking organization membership…</p>;
  }

  const organization =
    !isAccessError(query.error) && !query.error
      ? query.data?.find((item) => item.id === organizationId)
      : undefined;

  if (!organization) {
    return (
      <div className="space-y-3">
        <InlineAlert tone="warning">
          An active membership in the parent organization is required. Refresh
          your memberships or contact its administrator.
        </InlineAlert>
        <Button
          type="button"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          Refresh memberships
        </Button>
      </div>
    );
  }

  return (
    <EventDestination
      user={user}
      organizationId={organizationId}
      organizationSlug={organization.slug}
      eventId={eventId}
    />
  );
};
