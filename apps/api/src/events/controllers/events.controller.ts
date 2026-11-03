import {
  Get,
  Body,
  Post,
  Patch,
  Param,
  Query,
  Header,
  HttpCode,
  HttpStatus,
  Controller,
  ParseUUIDPipe,
} from '@nestjs/common';

import { type EventScope } from '../types/eventScope.type';
import { EventsService } from '../services/events.service';
import { toEventResponseDto } from '../mappers/eventResponse.mapper';
import { SensitiveAction } from '../../auth/decorators/sensitiveAction.decorator';
import type { OrganizationScope } from '../../organizations/types/organizationScope.type';
import { OrganizationScoped } from '../../organizations/decorators/organizationScoped.decorator';
import { RequireOrganizationPermissions } from '../../organizations/decorators/requiredOrganizationPermissions.decorator';
import { CurrentOrganization } from '../../organizations/decorators/currentOrganization.decorator';
import { CreateEventDto } from '../dtos/createEvent.dto';
import {
  EventPageResponseDto,
  EventResponseDto,
} from '../dtos/eventResponse.dto';
import { ListEventQueryDto } from '../dtos/listEventsQuery.dto';
import { UpdateEventDto } from '../dtos/updateEvent.dto';
import { UpdateEventStatusDto } from '../dtos/updateEventStatus.dto';
import { EventScoped } from '../decorators/eventScoped.decorator';
import { RequireEventPermissions } from '../decorators/requireEventPermissions.decorator';
import { CurrentEvent } from '../decorators/currentEvent.decorator';

@Controller('organizations/:organizationId/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @OrganizationScoped()
  @HttpCode(HttpStatus.CREATED)
  @Header('Cache-Control', 'no-store')
  @RequireOrganizationPermissions('organization:events:create')
  @SensitiveAction('createEvent')
  async createEvent(
    @CurrentOrganization() scope: OrganizationScope,
    @Body() input: CreateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.create(scope, input);

    return toEventResponseDto(event);
  }

  @Get()
  @OrganizationScoped()
  @Header('Cache-Control', 'no-store')
  @RequireOrganizationPermissions('organization:events:read')
  async listEvents(
    @CurrentOrganization() scope: OrganizationScope,
    @Query() input: ListEventQueryDto,
  ): Promise<EventPageResponseDto> {
    const page = await this.eventsService.list(scope, input);

    return {
      items: page.items.map(toEventResponseDto),
      nextCursor: page.nextCursor,
    };
  }

  @Get(':eventId')
  @EventScoped()
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:read')
  async getEvent(
    @CurrentEvent() scope: EventScope,
    @Param('eventId', new ParseUUIDPipe({ version: '4' }))
    eventId: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.get(scope, eventId);

    return toEventResponseDto(event);
  }

  @Patch(':eventId')
  @EventScoped()
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:update')
  @SensitiveAction('updateEvent')
  async updateEvent(
    @CurrentEvent() scope: EventScope,
    @Param('eventId', new ParseUUIDPipe({ version: '4' }))
    eventId: string,
    @Body() input: UpdateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.update(scope, eventId, input);

    return toEventResponseDto(event);
  }

  @Patch(':eventId/status')
  @EventScoped()
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:manage-status')
  @SensitiveAction('updateEventStatus')
  async updateEventStatus(
    @CurrentEvent() scope: EventScope,
    @Param('eventId', new ParseUUIDPipe({ version: '4' }))
    eventId: string,
    @Body() input: UpdateEventStatusDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.updateStatus(scope, eventId, input);

    return toEventResponseDto(event);
  }
}
