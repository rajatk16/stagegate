import { Badge } from '@/components';
import { useAuth } from '@/features/auth';

import { useActiveOrganization } from '../hooks';
import { LeaveOrganizationPanel } from '../components';

export const OrganizationDashboard = () => {
  const session = useAuth();
  const organization = useActiveOrganization();

  if (session.status !== 'authenticated') {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-dashed bg-card/50 p-6">
        <Badge variant="outline">Coming next</Badge>

        <h2 className="mt-4 text-xl font-semibold">Projects and workflows</h2>

        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          Your organization’s projects and workflows will appear here as those
          features become available.
        </p>
      </section>

      <LeaveOrganizationPanel
        key={`${session.user.uid}:${organization.id}`}
        user={session.user}
        organization={organization}
      />
    </div>
  );
};
