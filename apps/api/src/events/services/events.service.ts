import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode, ApplicationException } from '@/common';

import { Event } from '../entities';
import { EventRepository, EventSlugRepository } from '../repositories';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventSlugRepository: EventSlugRepository,
  ) {}

  async findById(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new ApplicationException(
        ErrorCode.EVENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Event not found',
      );
    }

    return event;
  }

  async findByOrganizationAndSlug(
    organizationId: string,
    slug: string,
  ): Promise<Event> {
    const slugReservation =
      await this.eventSlugRepository.findBySlugAndOrganizationId(
        organizationId,
        slug,
      );

    if (!slugReservation) {
      throw new ApplicationException(
        ErrorCode.EVENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Event not found',
      );
    }

    const event = await this.eventRepository.findById(slugReservation.eventId);

    if (!event || event.organizationId !== organizationId) {
      throw new ApplicationException(
        ErrorCode.EVENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Event not found',
      );
    }
    return event;
  }
}
