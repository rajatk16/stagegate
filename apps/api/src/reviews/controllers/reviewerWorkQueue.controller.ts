import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Get,
  Param,
  Query,
  Controller,
  BadRequestException,
} from '@nestjs/common';

import { Authorized } from '@/swagger';
import { OrganizationContext } from '@/organizations';
import { CurrentEvent, Event, EventContext } from '@/events';
import {
  CurrentUser,
  Permissions,
  EventPermission,
  type AuthenticatedUser,
} from '@/auth';

import {
  ReviewerWorkQueueService,
  ReviewerProposalViewService,
} from '../services';
import {
  ReviewerWorkQueueQueryDto,
  ReviewerWorkQueueResponseDto,
  ReviewerProposalViewResponseDto,
} from '../dtos';

@Authorized()
@ApiTags('Reviewer work queue')
@OrganizationContext('organizationSlug')
@EventContext('eventSlug')
@Controller('/organizations/:organizationSlug/events/:eventSlug/reviewer')
export class ReviewerWorkQueueController {
  constructor(
    private readonly reviewerWorkQueueService: ReviewerWorkQueueService,
    private readonly reviewerProposalViewService: ReviewerProposalViewService,
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

  @Get('assignments/:assignmentId/proposal')
  @Permissions(EventPermission.REVIEW_SUBMIT)
  @ApiOperation({
    summary:
      'Get an anonymized proposal for the authenticated reviewer assignment',
  })
  @ApiResponse({
    type: ReviewerProposalViewResponseDto,
  })
  async getAssignedProposal(
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('assignmentId') assignmentId: string,
  ): Promise<ReviewerProposalViewResponseDto> {
    if (!/^[a-f0-9]{64}$/i.test(assignmentId)) {
      throw new BadRequestException('Invalid assignment ID');
    }

    return this.reviewerProposalViewService.getAssignmedProposalView(
      event,
      user.userId,
      assignmentId,
    );
  }
}
