import { User } from 'firebase/auth';
import { Link } from 'react-router';

import { useEventQuery } from '@/app/query';
import { getEventWorkspacePath } from '@/lib';
import { Button, InlineAlert } from '@/components';

type Props = {
  user: User;
  organizationId: string;
  eventId: string;
  organizationSlug: string;
};

export const EventDestination = ({
  user,
  organizationId,
  organizationSlug,
  eventId,
}: Props & { organizationSlug: string }) => {
  const query = useEventQuery(user, organizationId, eventId);

  if (query.error) {
    return (
      <div className="space-y-3">
        <InlineAlert tone="warning">The event could not be loaded.</InlineAlert>
        <Button
          type="button"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          Refresh event
        </Button>
      </div>
    );
  }

  if (!query.data) {
    return <p role="status">Loading event link…</p>;
  }

  return (
    <Button asChild>
      <Link to={getEventWorkspacePath(organizationSlug, query.data.slug)}>
        Open event
      </Link>
    </Button>
  );
};
