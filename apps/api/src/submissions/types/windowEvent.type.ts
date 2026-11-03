import { Event } from '../../events/models/event.model';

export type WindowEvent = Pick<
  Event,
  'status' | 'submissionOpensAt' | 'submissionClosesAt'
>;
