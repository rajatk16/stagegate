import { Event } from '../models';
import { EventResponseDto } from '../dtos';

export const toEventResponseDto = (event: Event): EventResponseDto => ({
  id: event.id,
  name: event.name,
  slug: event.slug,
  status: event.status,
  format: event.format,
  location: event.location,
  timezone: event.timezone,
  description: event.description,
  organizationId: event.organizationId,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
  endsAt: event.endsAt?.toISOString() ?? null,
  startsAt: event.startsAt?.toISOString() ?? null,
});
