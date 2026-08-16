import { toIso } from '@/common';
import { Event } from '@/events';

import { PublicEventDto } from '../dtos';

export class PublicEventMapper {
  static toDto(event: Event): PublicEventDto {
    return {
      id: event.publicId,
      name: event.name,
      slug: event.slug,
      description: event.description ?? null,
      endsAt: toIso(event.endsAt),
      startsAt: toIso(event.startsAt),
      timezone: event.timezone,
    };
  }
}
