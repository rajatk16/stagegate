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
  submissionOpensAt: string | null;
  submissionClosesAt: string | null;
  submissionInstructions: string | null;
  maxSubmissionsPerPerson: number | null;
};

export type EventSettings = Event & EventSettingsValues;

export type UpdateEventSettingsInput = EventSettingsValues;
