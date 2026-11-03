import { EventSection } from '../types';

export const EVENT_SECTIONS: Record<string, EventSection> = {
  overview: {
    segment: '',
    label: 'Overview',
    permission: 'event:read',
    deniedDescription:
      'Your current access does not allow you to view this event.',
  },
  team: {
    segment: 'team',
    label: 'Team',
    permission: 'event:members:read',
    deniedDescription:
      'Your current event access does not allow you to view the team.',
  },
  settings: {
    segment: 'settings',
    label: 'Settings',
    permission: 'event:update',
    deniedDescription:
      'Your current event access does not allow you to edit settings.',
  },
};

export type EventSectionKey = keyof typeof EVENT_SECTIONS;
