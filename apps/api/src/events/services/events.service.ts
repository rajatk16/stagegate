import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';

import { EventScope } from '../types/eventScope.type';
import { EventsRepository } from '../repositories/events.repository';
import { ApiException } from '../../common/exceptions/api.exception';
import { OrganizationScope } from '../../organizations/types/organizationScope.type';
import { Event, eventSchema, EventSettingsUpdate } from '../models/event.model';
import { CreateEventDto } from '../dtos/createEvent.dto';
import { ListEventQueryDto } from '../dtos/listEventsQuery.dto';
import { UpdateEventDto } from '../dtos/updateEvent.dto';
import { UpdateEventStatusDto } from '../dtos/updateEventStatus.dto';
import { ServerClock } from '../../common/services/serverClock.service';
import { apiInstantSchema } from '../../common/models/instant.model';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly serverClock: ServerClock,
  ) {}

  async create(
    scope: OrganizationScope,
    input: CreateEventDto,
  ): Promise<Event> {
    const now = this.serverClock.now();

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

    const dateFields = [
      'startsAt',
      'endsAt',
      'submissionOpensAt',
      'submissionClosesAt',
    ] as const;

    for (const field of dateFields) {
      const value = input[field];

      if (value !== undefined) {
        changes[field] = value === null ? null : apiInstantSchema.parse(value);
      }
    }

    if (input.timezone !== undefined) {
      changes.timezone = input.timezone;
    }

    if (input.submissionInstructions !== undefined) {
      changes.submissionInstructions = input.submissionInstructions;
    }

    if (input.maxSubmissionsPerPerson !== undefined) {
      changes.maxSubmissionsPerPerson = input.maxSubmissionsPerPerson;
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
