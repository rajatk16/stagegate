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

import { EventsService } from '../services';
import { toEventResponseDto } from '../mappers';
import { SensitiveAction } from '../../auth/decorators';
import type { OrganizationScope } from '../../organizations/types';
import {
  OrganizationScoped,
  CurrentOrganization,
  RequireOrganizationPermissions,
} from '../../organizations/decorators';
import {
  CreateEventDto,
  UpdateEventDto,
  EventResponseDto,
  ListEventQueryDto,
  EventPageResponseDto,
  UpdateEventStatusDto,
} from '../dtos';

@Controller('organizations/:organizationId/events')
@OrganizationScoped()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
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

  @Patch(':eventId')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @RequireOrganizationPermissions('organization:events:update')
  @SensitiveAction('updateEvent')
  async updateEvent(
    @CurrentOrganization() scope: OrganizationScope,
    @Param('eventId', new ParseUUIDPipe({ version: '4' })) eventId: string,
    @Body() input: UpdateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.update(scope, eventId, input);

    return toEventResponseDto(event);
  }

  @Patch(':eventId/status')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @RequireOrganizationPermissions('organization:events:manage-status')
  @SensitiveAction('updateEventStatus')
  async updateEventStatus(
    @CurrentOrganization() scope: OrganizationScope,
    @Param('eventId', new ParseUUIDPipe({ version: '4' })) eventId: string,
    @Body() input: UpdateEventStatusDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.updateStatus(scope, eventId, input);

    return toEventResponseDto(event);
  }
}
