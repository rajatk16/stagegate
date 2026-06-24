import { useAuthenticatedUser } from '@/features/auth';

import { useHasOrganizations } from '@/features/organizations';
import { NoOrganizationState } from '../components';

const DashboardPage = () => {
  const user = useAuthenticatedUser();

  const hasOrganizations = useHasOrganizations();

  if (!hasOrganizations) {
    return <NoOrganizationState />;
  } else {
    return (
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.displayName}!
        </h1>

        <p className="mt-2 text-muted-foreground">
          Here's what's happening with your events and proposals.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">Total Proposals</div>

          <div className="rounded-xl border bg-card p-6">Active Reviewers</div>

          <div className="rounded-xl border bg-card p-6">Accepted Talks</div>
        </div>
      </div>
    );
  }
};
export default DashboardPage;
