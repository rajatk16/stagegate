import {
  Get,
  Body,
  Post,
  Query,
  Header,
  HttpCode,
  HttpStatus,
  Controller,
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
  EventResponseDto,
  ListEventQueryDto,
  EventPageResponseDto,
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
}
