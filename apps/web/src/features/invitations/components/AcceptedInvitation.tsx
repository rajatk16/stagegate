import { Link } from 'react-router';
import type { User } from 'firebase/auth';

import { getOrganizationPath } from '@/lib';
import { Button, InlineAlert } from '@/components';
import { isAccessError, useMyOrganizationsQuery } from '@/app/query';

import type { AcceptedInvitation as AcceptanceResult } from '../types';

type Props = {
  user: User;
  result: AcceptanceResult;
};

export const AcceptedInvitation = ({ user, result }: Props) => {
  const query = useMyOrganizationsQuery(user);

  const organization = isAccessError(query.error)
    ? undefined
    : query.data?.find((item) => item.id === result.organizationId);

  return (
    <div className="space-y-4">
      <InlineAlert tone="success" title="Membership confirmed">
        {result.alreadyAccepted
          ? 'You have already accepted this invitation.'
          : 'You have joined the organization.'}
      </InlineAlert>

      {!organization && !query.isFetching && (
        <InlineAlert tone="warning">
          Your membership is confirmed, but the organization could not be
          loaded. Refresh your organizations to check again.
        </InlineAlert>
      )}

      <div className="flex flex-wrap gap-3">
        {organization ? (
          <Button asChild>
            <Link to={getOrganizationPath(organization.slug)} replace>
              Open {organization.name}
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            {query.isFetching ? 'Loading…' : 'Refresh organizations'}
          </Button>
        )}

        <Button asChild variant="outline">
          <Link to="/organizations">View organizations</Link>
        </Button>
      </div>
    </div>
  );
};
