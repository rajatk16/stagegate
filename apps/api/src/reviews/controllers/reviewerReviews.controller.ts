import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Get,
  Body,
  Post,
  Param,
  Patch,
  Controller,
  BadRequestException,
} from '@nestjs/common';

import { Authorized } from '@/swagger';
import { CurrentEvent, Event, EventContext } from '@/events';
import { Organization, OrganizationContext } from '@/organizations';
import {
  CurrentUser,
  Permissions,
  EventPermission,
  CurrentOrganization,
  type AuthenticatedUser,
} from '@/auth';

import { ReviewerReviewMapper } from '../mappers';
import { ReviewApplicationService } from '../services';
import {
  SubmitReviewDto,
  UpdateReviewDraftDto,
  ReviewerReviewResponseDto,
  ReviewerReviewWorkspaceResponseDto,
} from '../dtos';

@Authorized()
@ApiTags('Reviewer reviews')
@OrganizationContext('organizationSlug')
@EventContext('eventSlug')
@Controller('/organizations/:organizationSlug/events/:eventSlug/reviewer')
export class ReviewerReviewsController {
  constructor(
    private readonly reviewApplicationService: ReviewApplicationService,
  ) {}

  @Get('assignments/:assignmentId/review')
  @Permissions(EventPermission.REVIEW_SUBMIT)
  @ApiOperation({
    summary: 'Get the authenticated reviewer review workspace',
  })
  @ApiResponse({
    type: ReviewerReviewWorkspaceResponseDto,
  })
  async getReviewWorkspace(
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('assignmentId') assignmentId: string,
  ): Promise<ReviewerReviewWorkspaceResponseDto> {
    this.assertAssignmentId(assignmentId);

    const workspace = await this.reviewApplicationService.getOwnReview(
      event,
      user.userId,
      assignmentId,
    );

    return ReviewerReviewMapper.toWorkspaceDto(workspace);
  }

  @Post('assignments/:assignmentId/review/draft')
  @Permissions(EventPermission.REVIEW_SUBMIT)
  @ApiOperation({
    summary: 'Create an empty review draft for an assignment',
  })
  @ApiResponse({
    type: ReviewerReviewResponseDto,
  })
  async createDraft(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('assignmentId') assignmentId: string,
  ): Promise<ReviewerReviewResponseDto> {
    this.assertAssignmentId(assignmentId);

    const review = await this.reviewApplicationService.createDraft(
      organization,
      event,
      user.userId,
      assignmentId,
    );

    return ReviewerReviewMapper.toReviewDto(review);
  }

  @Patch('assignments/:assignmentId/review/draft')
  @Permissions(EventPermission.REVIEW_SUBMIT)
  @ApiOperation({
    summary: 'Update an existing review draft',
  })
  @ApiBody({ type: UpdateReviewDraftDto })
  @ApiResponse({
    type: ReviewerReviewResponseDto,
  })
  async updateDraft(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateReviewDraftDto,
  ): Promise<ReviewerReviewResponseDto> {
    this.assertAssignmentId(assignmentId);

    const review = await this.reviewApplicationService.updateDraft(
      organization,
      event,
      user.userId,
      assignmentId,
      dto,
    );

    return ReviewerReviewMapper.toReviewDto(review);
  }

  @Post('assignments/:assignmentId/review/submit')
  @Permissions(EventPermission.REVIEW_SUBMIT)
  @ApiOperation({
    summary: 'Submit a completed review',
  })
  @ApiBody({ type: SubmitReviewDto })
  @ApiResponse({
    type: ReviewerReviewResponseDto,
  })
  async submitReview(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: SubmitReviewDto,
  ): Promise<ReviewerReviewResponseDto> {
    this.assertAssignmentId(assignmentId);

    const review = await this.reviewApplicationService.submitReview(
      organization,
      event,
      user.userId,
      assignmentId,
      dto,
    );

    return ReviewerReviewMapper.toReviewDto(review);
  }

  @Post('assignments/:assignmentId/review/reopen')
  @Permissions(EventPermission.REVIEW_SUBMIT)
  @ApiOperation({
    summary: 'Reopen a submitted review when revisions are enabled',
  })
  @ApiResponse({
    type: ReviewerReviewResponseDto,
  })
  async reopenReview(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('assignmentId') assignmentId: string,
  ): Promise<ReviewerReviewResponseDto> {
    this.assertAssignmentId(assignmentId);

    const review = await this.reviewApplicationService.reopenSubmittedReview(
      organization,
      event,
      user.userId,
      assignmentId,
    );

    return ReviewerReviewMapper.toReviewDto(review);
  }

  private assertAssignmentId(assignmentId: string): void {
    if (!/^[a-f0-9]{64}$/i.test(assignmentId)) {
      throw new BadRequestException('Invalid assignment ID');
    }
  }
}
