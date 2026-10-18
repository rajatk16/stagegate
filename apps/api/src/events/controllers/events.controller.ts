import {
  Body,
  Post,
  Header,
  HttpCode,
  HttpStatus,
  Controller,
} from '@nestjs/common';

import { EventsService } from '../services';
import { toEventResponseDto } from '../mappers';
import { SensitiveAction } from '../../auth/decorators';
import { CreateEventDto, EventResponseDto } from '../dtos';
import type { OrganizationScope } from '../../organizations/types';
import {
  CurrentOrganization,
  OrganizationScoped,
  RequireOrganizationPermissions,
} from '../../organizations/decorators';

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
}
