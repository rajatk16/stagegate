import { User } from 'firebase/auth';

import { EventAccess } from './eventTeam';
import { EventSettings } from './eventSettings';
import { EffectiveEventCapabilities } from '../utils';

export type EventWorkspace = {
  user: User;
  access: EventAccess;
  event: EventSettings;
  accessReady: boolean;
  organizationId: string;
  organizationSlug: string;
  refreshAccess: () => Promise<void>;
  capabilities: EffectiveEventCapabilities;
  reloadEvent: () => Promise<EventSettings>;
};
