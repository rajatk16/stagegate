import { Navigate, useLocation } from 'react-router';

import { getOrganizationPath } from '@/lib';
import { useOrganizations } from '@/features';
import { Button, InlineAlert } from '@/components';

export const Dashboard = () => {
  const location = useLocation();
  const { state, reload } = useOrganizations();

  if (state.status === 'loading') {
    return (
      <p role="status" className="text-muted-foreground">
        Opening your dashboard...
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <InlineAlert tone="error" title="Could not load your organizations">
          {state.message}
        </InlineAlert>

        <Button type="button" variant="outline" onClick={reload}>
          Try Again
        </Button>
      </div>
    );
  }

  const firstOrganization = state.organizations[0];

  return (
    <Navigate
      to={
        firstOrganization
          ? getOrganizationPath(firstOrganization.slug)
          : '/organizations/new'
      }
      replace
      state={location.state}
    />
  );
};
