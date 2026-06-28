import { Bell } from 'lucide-react';

import { Button } from '@/components/ui';

export const NotificationButton = () => (
  <Button variant="ghost" size="icon" aria-label="Notifications">
    <Bell className="h-5 w-5" />
  </Button>
);
