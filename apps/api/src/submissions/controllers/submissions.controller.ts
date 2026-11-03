import { Controller, Get, Header } from '@nestjs/common';

import { type EventScope } from '../../events/types/eventScope.type';
import { EventScoped } from '../../events/decorators/eventScoped.decorator';
import { CurrentEvent } from '../../events/decorators/currentEvent.decorator';
import { SubmissionWindowResponseDto } from '../dtos/submissionWindowResponse.dto';
import { EventSubmissionWindowService } from '../services/eventSubmissionWindow.service';
import { RequireEventPermissions } from '../../events/decorators/requireEventPermissions.decorator';

@Controller('organizations/:organizationId/events/:eventId')
export class SubmissionController {
  constructor(
    private readonly eventSubmissionWindowService: EventSubmissionWindowService,
  ) {}
  @Get('submission-window')
  @EventScoped()
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:read')
  getSubmissionWindow(
    @CurrentEvent() scope: EventScope,
  ): Promise<SubmissionWindowResponseDto> {
    return this.eventSubmissionWindowService.current(scope);
  }
}
