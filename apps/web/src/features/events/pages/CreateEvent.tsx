import { Link, useNavigate } from 'react-router';

import { Button } from '@/components';
import { useAuth } from '@/features/auth';
import { getOrganizationPath } from '@/lib';
import {
  useOrganizations,
  useActiveOrganization,
} from '@/features/organizations';

import { CreateEventForm } from '../components';

export const CreateEvent = () => {
  const session = useAuth();
  const organization = useActiveOrganization();
  const { reload } = useOrganizations();
  const navigate = useNavigate();

  if (session.status !== 'authenticated') {
    return null;
  }

  const dashboardPath = getOrganizationPath(organization.slug);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Create an event</h2>
        <p className="text-muted-foreground">
          Add a new event to {organization.name}
        </p>
      </header>

      <section className="rounded-2xl border bg-card p-4 sm:p-6">
        <CreateEventForm
          key={`${session.user.uid}:${organization.id}`}
          user={session.user}
          organizationId={organization.id}
          onCreated={(event) => {
            void navigate(dashboardPath, {
              replace: true,
              state: {
                createdEvent: {
                  organizationId: organization.id,
                  uid: session.user.uid,
                  id: event.id,
                  name: event.name,
                },
              },
            });
          }}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to={dashboardPath}>Back to Events</Link>
        </Button>

        <Button type="button" variant="outline" onClick={reload}>
          Refresh Access
        </Button>
      </div>
    </div>
  );
};
