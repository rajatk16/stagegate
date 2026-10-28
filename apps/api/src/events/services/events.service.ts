import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';

import { EventScope } from '../types';
import { EventsRepository } from '../repositories/events.repository';
import { ApiException } from '../../common/exceptions';
import { OrganizationScope } from '../../organizations/types';
import { Event, eventSchema, EventSettingsUpdate } from '../models';
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

  get(scope: EventScope, eventId: string): Promise<Event> {
    return this.eventsRepository.get(scope, eventId);
  }

  update(
    scope: EventScope,
    eventId: string,
    input: UpdateEventDto,
  ): Promise<Event> {
    const changes: EventSettingsUpdate = {};

    if (input.name !== undefined) {
      changes.name = input.name;
    }

    if (input.description !== undefined) {
      changes.description = input.description;
    }

    if (input.format !== undefined) {
      changes.format = input.format;
    }

    if (input.location !== undefined) {
      changes.location = input.location;
    }

    if (input.startsAt !== undefined) {
      changes.startsAt =
        input.startsAt === null ? null : new Date(input.startsAt);
    }

    if (input.endsAt !== undefined) {
      changes.endsAt = input.endsAt === null ? null : new Date(input.endsAt);
    }

    if (input.timezone !== undefined) {
      changes.timezone = input.timezone;
    }

    if (Object.keys(changes).length === 0) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'EVENT_SETTINGS_EMPTY',
        'Provide at least one event setting to update',
      );
    }

    return this.eventsRepository.updateSettings(scope, eventId, changes);
  }

  updateStatus(
    scope: EventScope,
    eventId: string,
    input: UpdateEventStatusDto,
  ): Promise<Event> {
    return this.eventsRepository.updateStatus(scope, eventId, input.status);
  }
}
