import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import { Event, eventSchema } from '../models';
import { EventsRepository } from '../repositories';
import { OrganizationScope } from '../../organizations/types';
import {
  CreateEventDto,
  UpdateEventDto,
  ListEventQueryDto,
  UpdateEventStatusDto,
} from '../dtos';

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

  list(scope: OrganizationScope, input: ListEventQueryDto) {
    return this.eventsRepository.list(scope, input.limit, input.cursor);
  }

  update(
    scope: OrganizationScope,
    eventId: string,
    input: UpdateEventDto,
  ): Promise<Event> {
    return this.eventsRepository.updateName(scope, eventId, input.name);
  }

  updateStatus(
    scope: OrganizationScope,
    eventId: string,
    input: UpdateEventStatusDto,
  ): Promise<Event> {
    return this.eventsRepository.updateStatus(scope, eventId, input.status);
  }
}
