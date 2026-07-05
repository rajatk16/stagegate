import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Settings, Users } from 'lucide-react';

import {
  Card,
  Button,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui';

import { ORGANIZATION_ROUTES } from '../../constants';

export const OrganizationDashboardQuickActions = ({
  slug,
}: {
  slug: string;
}) => {
  const navigate = useNavigate();
  return (
    <section>
      <h2 className="mb-4 text-lg font-medium">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CalendarPlus className="h-5 w-5" />
            <CardTitle>Create Event</CardTitle>
            <CardDescription>Start accepting proposals</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-5 w-5" />
            <CardTitle>Invite Members</CardTitle>
            <CardDescription>Collaborate with your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(ORGANIZATION_ROUTES.MEMBERS(slug))}
            >
              Members
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Settings className="h-5 w-5" />
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>Confgure your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(ORGANIZATION_ROUTES.SETTINGS(slug))}
            >
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
