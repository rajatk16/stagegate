import {
  Get,
  Put,
  Body,
  Post,
  Param,
  Patch,
  Controller,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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

import { ReviewMapper } from '../mappers';
import {
  ReviewConflictApplicationService,
  ReviewAssignmentApplicationService,
  ReviewConfigurationApplicationService,
  ReviewerEligibilityApplicationService,
} from '../services';
import {
  DeclareConflictDto,
  ResolveConflictDto,
  CreateReviewPeriodDto,
  UpdateReviewPeriodDto,
  UpsertReviewRubricDto,
  ReviewPeriodResponseDto,
  ReviewRubricResponseDto,
  CreateReviewAssignmentDto,
  ReviewConflictResponseDto,
  RevokeReviewAssignmentDto,
  SetReviewerEligibilityDto,
  ReviewAssignmentResponseDto,
  ReviewerEligibilityResponseDto,
} from '../dtos';

@Authorized()
@ApiTags('Reviews')
@OrganizationContext('organizationSlug')
@EventContext('eventSlug')
@Controller('/organizations/:organizationSlug/events/:eventSlug/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewConfigurationApplicationService: ReviewConfigurationApplicationService,
    private readonly reviewerEligibilityApplicationService: ReviewerEligibilityApplicationService,
    private readonly reviewConflictApplicationService: ReviewConflictApplicationService,
    private readonly reviewAssignmentApplicationService: ReviewAssignmentApplicationService,
  ) {}

  @Get('rubric')
  @Permissions(EventPermission.REVIEW_READ_ALL)
  @ApiOperation({ summary: 'Get the current CFP review rubric' })
  @ApiResponse({ type: ReviewRubricResponseDto })
  async getRubric(
    @CurrentEvent() event: Event,
  ): Promise<ReviewRubricResponseDto> {
    const rubric =
      await this.reviewConfigurationApplicationService.getRubric(event);

    return ReviewMapper.toRubricDto(rubric);
  }

  @Put('rubric')
  @Permissions(EventPermission.RUBRIC_MANAGE)
  @ApiOperation({ summary: 'Create or replace the CFP review rubric' })
  @ApiBody({ type: UpsertReviewRubricDto })
  @ApiResponse({ type: ReviewRubricResponseDto })
  async upsertRubric(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertReviewRubricDto,
  ): Promise<ReviewRubricResponseDto> {
    const rubric =
      await this.reviewConfigurationApplicationService.upsertRubric(
        organization,
        event,
        user.userId,
        dto,
      );

    return ReviewMapper.toRubricDto(rubric);
  }

  @Get('periods')
  @Permissions(EventPermission.REVIEW_READ_ALL)
  @ApiOperation({ summary: 'List review periods for the CFP' })
  @ApiResponse({ type: [ReviewPeriodResponseDto] })
  async listPeriods(
    @CurrentEvent() event: Event,
  ): Promise<ReviewPeriodResponseDto[]> {
    const periods =
      await this.reviewConfigurationApplicationService.listPeriod(event);

    return periods.map((period) => ReviewMapper.toPeriodDto(period));
  }

  @Post('periods')
  @Permissions(EventPermission.REVIEW_PERIOD_MANAGE)
  @ApiOperation({ summary: 'Create a draft review period' })
  @ApiBody({ type: CreateReviewPeriodDto })
  @ApiResponse({ type: ReviewPeriodResponseDto })
  async createPeriod(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewPeriodDto,
  ): Promise<ReviewPeriodResponseDto> {
    const period =
      await this.reviewConfigurationApplicationService.createPeriod(
        organization,
        event,
        user.userId,
        dto,
      );

    return ReviewMapper.toPeriodDto(period);
  }

  @Patch('periods/:reviewPeriodId')
  @Permissions(EventPermission.REVIEW_PERIOD_MANAGE)
  @ApiOperation({ summary: 'Update a draft review period' })
  @ApiBody({ type: UpdateReviewPeriodDto })
  @ApiResponse({ type: ReviewPeriodResponseDto })
  async updatePeriod(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @Param('reviewPeriodId', ParseUUIDPipe) reviewPeriodId: string,
    @Body() dto: UpdateReviewPeriodDto,
  ): Promise<ReviewPeriodResponseDto> {
    const period =
      await this.reviewConfigurationApplicationService.updatePeriod(
        organization,
        event,
        reviewPeriodId,
        dto,
      );

    return ReviewMapper.toPeriodDto(period);
  }

  @Post('periods/:reviewPeriodId/open')
  @Permissions(EventPermission.REVIEW_PERIOD_MANAGE)
  @ApiOperation({ summary: 'Open a draft review period' })
  @ApiResponse({ type: ReviewPeriodResponseDto })
  async openPeriod(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @Param('reviewPeriodId', ParseUUIDPipe) reviewPeriodId: string,
  ): Promise<ReviewPeriodResponseDto> {
    const period = await this.reviewConfigurationApplicationService.openPeriod(
      organization,
      event,
      reviewPeriodId,
    );

    return ReviewMapper.toPeriodDto(period);
  }

  @Post('periods/:reviewPeriodId/close')
  @Permissions(EventPermission.REVIEW_PERIOD_MANAGE)
  @ApiOperation({ summary: 'Close an open review period' })
  @ApiResponse({ type: ReviewPeriodResponseDto })
  async closePeriod(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @Param('reviewPeriodId', ParseUUIDPipe) reviewPeriodId: string,
  ): Promise<ReviewPeriodResponseDto> {
    const period = await this.reviewConfigurationApplicationService.closePeriod(
      organization,
      event,
      reviewPeriodId,
    );

    return ReviewMapper.toPeriodDto(period);
  }

  @Put('reviewers/:reviewerUserId/eligibility')
  @Permissions(EventPermission.REVIEW_ASSIGN)
  @ApiOperation({ summary: 'Set reviewer eligibility for an event' })
  @ApiBody({ type: SetReviewerEligibilityDto })
  @ApiResponse({ type: ReviewerEligibilityResponseDto })
  async setReviewerEligibility(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('reviewerUserId', ParseUUIDPipe) reviewerUserId: string,
    @Body() dto: SetReviewerEligibilityDto,
  ): Promise<ReviewerEligibilityResponseDto> {
    const eligibility =
      await this.reviewerEligibilityApplicationService.setEligibility(
        organization,
        event,
        user.userId,
        reviewerUserId,
        dto,
      );

    return ReviewMapper.toEligibilityDto(eligibility);
  }

  @Post('reviewer/proposals/:proposalId/conflicts')
  @Permissions(EventPermission.CONFLICT_DECLARE)
  @ApiOperation({ summary: 'Declare a conflict of interest for yourself' })
  @ApiBody({ type: DeclareConflictDto })
  @ApiResponse({ type: ReviewConflictResponseDto })
  async declareConflict(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('proposalId', ParseUUIDPipe) proposalId: string,
    @Body() dto: DeclareConflictDto,
  ): Promise<ReviewConflictResponseDto> {
    const conflict =
      await this.reviewConflictApplicationService.declareConflict(
        organization,
        event,
        user.userId,
        proposalId,
        dto,
      );

    return ReviewMapper.toConflictDto(conflict);
  }

  @Patch('proposals/:proposalId/reviewers/:reviewerUserId/conflict')
  @Permissions(EventPermission.CONFLICT_MANAGE)
  @ApiOperation({
    summary: 'Confirm or dismiss a reviewer conflict of interest',
  })
  @ApiBody({ type: ResolveConflictDto })
  @ApiResponse({ type: ReviewConflictResponseDto })
  async resolveConflict(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('proposalId', ParseUUIDPipe) proposalId: string,
    @Param('reviewerUserId', ParseUUIDPipe) reviewerUserId: string,
    @Body() dto: ResolveConflictDto,
  ): Promise<ReviewConflictResponseDto> {
    const conflict =
      await this.reviewConflictApplicationService.resolveConflict(
        organization,
        event,
        user.userId,
        proposalId,
        reviewerUserId,
        dto,
      );

    return ReviewMapper.toConflictDto(conflict);
  }

  @Post('periods/:reviewPeriodId/assignments')
  @Permissions(EventPermission.REVIEW_ASSIGN)
  @ApiOperation({ summary: 'Assign a proposal to an eligible reviewer' })
  @ApiBody({ type: CreateReviewAssignmentDto })
  @ApiResponse({ type: ReviewAssignmentResponseDto })
  async createAssignment(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('reviewPeriodId', ParseUUIDPipe) reviewPeriodId: string,
    @Body() dto: CreateReviewAssignmentDto,
  ): Promise<ReviewAssignmentResponseDto> {
    const assignment =
      await this.reviewAssignmentApplicationService.createAssignment(
        organization,
        event,
        user.userId,
        reviewPeriodId,
        dto,
      );

    return ReviewMapper.toAssignmentDto(assignment);
  }

  @Patch('assignments/:assignmentId/revoke')
  @Permissions(EventPermission.REVIEW_ASSIGN)
  @ApiOperation({ summary: 'Revoke an active review assignment' })
  @ApiBody({ type: RevokeReviewAssignmentDto })
  @ApiResponse({ type: ReviewAssignmentResponseDto })
  async revokeAssignment(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: RevokeReviewAssignmentDto,
  ): Promise<ReviewAssignmentResponseDto> {
    if (!/^[a-f0-9]{64}$/i.test(assignmentId)) {
      throw new BadRequestException('Invalid assignment ID');
    }

    const assignment =
      await this.reviewAssignmentApplicationService.revokeAssignment(
        organization,
        event,
        user.userId,
        assignmentId,
        dto,
      );

    return ReviewMapper.toAssignmentDto(assignment);
  }
}
