import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Authorized } from '@/swagger';
import { OrganizationContext } from '@/organizations';
import { CurrentEvent, Event, EventContext } from '@/events';
import {
  CurrentUser,
  Permissions,
  EventPermission,
  type AuthenticatedUser,
} from '@/auth';

import { ReviewerWorkQueueService } from '../services';
import {
  ReviewerWorkQueueQueryDto,
  ReviewerWorkQueueResponseDto,
} from '../dtos';

@Authorized()
@ApiTags('Reviewer work queue')
@OrganizationContext('organizationSlug')
@EventContext('eventSlug')
@Controller('/organizations/:organizationSlug/events/:eventSlug/reviewer')
export class ReviewerWorkQueueController {
  constructor(
    private readonly reviewerWorkQueueService: ReviewerWorkQueueService,
  ) {}

  @Get('work-queue')
  @Permissions(EventPermission.REVIEWER_QUEUE_READ)
  @ApiOperation({
    summary: 'Get the current reviewer work queue',
  })
  @ApiResponse({
    type: ReviewerWorkQueueResponseDto,
  })
  async getWorkQueue(
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ReviewerWorkQueueQueryDto,
  ) {
    return this.reviewerWorkQueueService.getWorkQueue(
      event,
      user.userId,
      query,
    );
  }
}
