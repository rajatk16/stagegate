import { Building2, CalendarDays, ClipboardList, UsersRound } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const upcomingModules = [
  {
    title: 'Organizations',
    description: 'Manage your conference organizations.',
    icon: Building2,
  },
  {
    title: 'Events',
    description: 'Create and manage your events.',
    icon: CalendarDays,
  },
  {
    title: 'Proposals',
    description: 'Collect and evaluate speaker submissions.',
    icon: ClipboardList,
  },
  {
    title: 'Reviewers',
    description: 'Coordinate your program committee.',
    icon: UsersRound,
  },
];

export const DashboardPage = () => (
  <div className="space-y-8">
    <PageHeader title="Welcome to StageGate" description="Your conference management workspace." />

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {upcomingModules.map(({ title, description, icon: Icon }) => (
        <Card key={title}>
          <CardHeader>
            <Icon className="mb-2 size-5 text-primary" aria-hidden="true" />

            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>

            <p className="text-xs font-medium text-muted-foreground">Planned module</p>
          </CardHeader>
        </Card>
      ))}
    </div>

    <EmptyState
      icon={Building2}
      title="Your organization workspace"
      description="Organization onboarding will become available after identity and authentication are implemented."
    />
  </div>
);
