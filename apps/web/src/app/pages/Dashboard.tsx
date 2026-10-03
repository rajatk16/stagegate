import { useAuth } from '@/features';

import { DashboardContent } from '../components';

export const Dashboard = () => {
  const session = useAuth();

  if (session.status !== 'authenticated') {
    return null;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Your profile, account, and next steps.
        </p>
      </header>

      <DashboardContent key={session.user.uid} user={session.user} />
    </div>
  );
};
