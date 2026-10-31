import { User } from 'firebase/auth';

import { EventAccess } from './eventTeam';
import { EventSettings } from './eventSettings';

export type EventWorkspace = {
  user: User;
  organizationId: string;
  organizationSlug: string;
  event: EventSettings;
  access: EventAccess;
  refreshAccess: () => Promise<void>;
  reloadEvent: () => Promise<EventSettings>;
};
