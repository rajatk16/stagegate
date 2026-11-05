import {
  Get,
  Body,
  Post,
  Param,
  Patch,
  Query,
  Delete,
  Header,
  HttpCode,
  Controller,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';

import { type EventScope } from '../types/eventScope.type';
import { EventScoped } from '../decorators/eventScoped.decorator';
import { CurrentEvent } from '../decorators/currentEvent.decorator';
import { SensitiveAction } from '../../auth/decorators/sensitiveAction.decorator';
import { EventConfigurationService } from '../services/eventConfiguration.service';
import { RequireEventPermissions } from '../decorators/requireEventPermissions.decorator';
import {
  ListEventConfigurationDto,
  CreateEventConfigurationDto,
  UpdateEventConfigurationDto,
} from '../dtos/eventConfiguration.dto';

@Controller('organizations/:organizationId/events/:eventId/configuration')
@EventScoped()
export class EventConfigurationController {
  constructor(private readonly configuration: EventConfigurationService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:read')
  list(
    @CurrentEvent() scope: EventScope,
    @Query() input: ListEventConfigurationDto,
  ) {
    return this.configuration.list(scope, input);
  }

  @Post()
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:update')
  @SensitiveAction('updateEvent')
  create(
    @CurrentEvent() scope: EventScope,
    @Body() input: CreateEventConfigurationDto,
  ) {
    return this.configuration.create(scope, input);
  }

  @Patch(':configurationId')
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:update')
  @SensitiveAction('updateEvent')
  update(
    @CurrentEvent() scope: EventScope,
    @Param('configurationId', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @Body() input: UpdateEventConfigurationDto,
  ) {
    return this.configuration.update(scope, id, input);
  }

  @Delete(':configurationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:update')
  @SensitiveAction('updateEvent')
  remove(
    @CurrentEvent() scope: EventScope,
    @Param('configurationId', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ): Promise<void> {
    return this.configuration.remove(scope, id);
  }
}
