import { toIso } from '@/common';

import { Event } from '../entities';
import { EventDetailsDto, EventSummaryDto } from '../dtos';

export class EventMapper {
  static toDetailsDto = (event: Event): EventDetailsDto => ({
    archivedAt: toIso(event.archivedAt),
    createdAt: toIso(event.createdAt)!,
    createdBy: event.createdBy,
    description: event.description,
    endsAt: toIso(event.endsAt),
    id: event.id,
    name: event.name,
    organizationId: event.organizationId,
    publicId: event.publicId,
    publishedAt: toIso(event.publishedAt),
    slug: event.slug,
    status: event.status,
    startsAt: toIso(event.startsAt),
    timezone: event.timezone,
    updatedAt: toIso(event.updatedAt)!,
  });

  static toSummaryDto = (event: Event): EventSummaryDto => ({
    id: event.id,
    name: event.name,
    organizationId: event.organizationId,
    publicId: event.publicId,
    slug: event.slug,
  });
}
