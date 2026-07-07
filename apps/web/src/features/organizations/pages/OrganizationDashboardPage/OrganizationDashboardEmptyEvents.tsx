import { CalendarPlus } from 'lucide-react';

import {
  Card,
  Button,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui';

export const OrganizationDashboardEmptyEvents = () => (
  <Card>
    <CardHeader>
      <CardTitle>Events</CardTitle>
      <CardDescription>You haven't created any events yet.</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col items-center gap-4 py-12">
      <CalendarPlus className="h-10 w-10 text-muted-foreground" />
      <div className="space-y-1 text-center">
        <h3 className="font-medium">No events yet.</h3>
        <p className="text-sm text-muted-foreground">
          Create your first event to get started.
        </p>
      </div>
      <Button disabled>Create Event</Button>
    </CardContent>
  </Card>
);
