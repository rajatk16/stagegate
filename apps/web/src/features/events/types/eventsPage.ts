import { Event } from './event';

export type EventsPage = {
  items: Event[];
  nextCursor: string | null;
};
