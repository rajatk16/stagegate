import { Mic2 } from 'lucide-react';
import { Link } from 'react-router';

import { paths } from '@/app/router/paths';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';

export function SpeakerDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Speaker dashboard"
        description="Manage your conference participation and talk proposals."
      />

      <EmptyState
        icon={Mic2}
        title="Your speaking journey starts here"
        description="Speaker profiles, reusable talks and CFP submissions will be introduced in a later phase."
        action={
          <Button variant="outline" asChild>
            <Link to={paths.speaker.proposals}>View proposals workspace</Link>
          </Button>
        }
      />
    </div>
  );
}
