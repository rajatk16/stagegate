import { Event } from '../models';
import { EventResponseDto } from '../dtos';

export const toEventResponseDto = (event: Event): EventResponseDto => ({
  id: event.id,
  organizationId: event.organizationId,
  name: event.name,
  slug: event.slug,
  status: event.status,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
});
