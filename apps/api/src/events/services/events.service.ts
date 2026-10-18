import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import { CreateEventDto } from '../dtos';
import { Event, eventSchema } from '../models';
import { EventsRepository } from '../repositories';
import { OrganizationScope } from '../../organizations/types';

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async create(
    scope: OrganizationScope,
    input: CreateEventDto,
  ): Promise<Event> {
    const now = new Date();

    const event = eventSchema.parse({
      id: randomUUID(),
      organizationId: scope.organizationId,
      name: input.name,
      slug: input.slug,
      status: 'DRAFT',
      createdByUid: scope.actorUid,
      createdAt: now,
      updatedAt: now,
    });

    return this.eventsRepository.create(scope, event);
  }
}
