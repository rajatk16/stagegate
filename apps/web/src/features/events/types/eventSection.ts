import { EventPermission } from './eventTeam';

export type EventSection = {
  segment: '' | 'team' | 'settings';
  label: string;
  permission: EventPermission;
  deniedDescription: string;
};
