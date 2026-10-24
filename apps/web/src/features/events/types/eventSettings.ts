import { Event } from './event';

export type EventFormat = 'IN_PERSON' | 'ONLINE' | 'HYBRID';

export type EventSettingsValues = {
  name: string;
  description: string | null;
  format: EventFormat | null;
  location: string | null;
  startsAt: string | null;
  endsAt: string | null;
  timezone: string;
};

export type EventSettings = Event & EventSettingsValues;

export type UpdateEventSettingsInput = EventSettingsValues;
