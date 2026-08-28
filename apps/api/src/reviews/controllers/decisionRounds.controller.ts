import {
  Get,
  Put,
  Body,
  Param,
  Post,
  Controller,
  ParseUUIDPipe,
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

import { DecisionRound, ProposalDecision } from '../entities';
import { DecisionRoundApplicationService } from '../services';
import {
  CreateDecisionRoundDto,
  DecisionRoundResponseDto,
  UpdateProposalDecisionDto,
  ProposalDecisionResponseDto,
} from '../dtos';

@Authorized()
@ApiTags('Decision rounds')
@OrganizationContext('organizationSlug')
@EventContext('eventSlug')
@Controller(
  '/organizations/:organizationSlug/events/:eventSlug/reviews/decision-rounds',
)
export class DecisionRoundsController {
  constructor(
    private readonly decisionRoundApplicationService: DecisionRoundApplicationService,
  ) {}

  @Post()
  @Permissions(EventPermission.DECISION_ROUND_MANAGE)
  @ApiOperation({
    summary: 'Create a draft decision round',
  })
  @ApiBody({ type: CreateDecisionRoundDto })
  @ApiResponse({ type: DecisionRoundResponseDto })
  async createRound(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDecisionRoundDto,
  ): Promise<DecisionRoundResponseDto> {
    const round = await this.decisionRoundApplicationService.createRound(
      organization,
      event,
      user.userId,
      dto,
    );

    return this.toDecisionRoundDto(round);
  }

  @Get()
  @Permissions(EventPermission.DECISION_READ)
  @ApiOperation({
    summary: 'List decision rounds for the current event',
  })
  @ApiResponse({ type: [DecisionRoundResponseDto] })
  async listRounds(
    @CurrentEvent() event: Event,
  ): Promise<DecisionRoundResponseDto[]> {
    const rounds = await this.decisionRoundApplicationService.listRounds(event);

    return rounds.map((round) => this.toDecisionRoundDto(round));
  }

  @Post(':decisionRoundId/open')
  @Permissions(EventPermission.DECISION_ROUND_MANAGE)
  @ApiOperation({
    summary: 'Open a draft decision round after review is closed',
  })
  @ApiResponse({ type: DecisionRoundResponseDto })
  async openRound(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @Param('decisionRoundId', ParseUUIDPipe) decisionRoundId: string,
  ): Promise<DecisionRoundResponseDto> {
    const round = await this.decisionRoundApplicationService.openRound(
      organization,
      event,
      decisionRoundId,
    );

    return this.toDecisionRoundDto(round);
  }

  @Post(':decisionRoundId/lock')
  @Permissions(EventPermission.DECISION_ROUND_MANAGE)
  @ApiOperation({
    summary: 'Lock a decision round and prevent further decision changes',
  })
  @ApiResponse({ type: DecisionRoundResponseDto })
  async lockRound(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('decisionRoundId', ParseUUIDPipe) decisionRoundId: string,
  ): Promise<DecisionRoundResponseDto> {
    const round = await this.decisionRoundApplicationService.lockRound(
      organization,
      event,
      user.userId,
      decisionRoundId,
    );

    return this.toDecisionRoundDto(round);
  }

  @Put(':decisionRoundId/proposals/:proposalId')
  @Permissions(EventPermission.PROPOSAL_DECISION_MANAGE)
  @ApiOperation({
    summary: 'Create or update a proposal decision in an open decision round',
  })
  @ApiBody({ type: UpdateProposalDecisionDto })
  @ApiResponse({ type: ProposalDecisionResponseDto })
  async setProposalDecision(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Param('decisionRoundId', ParseUUIDPipe) decisionRoundId: string,
    @Param('proposalId', ParseUUIDPipe) proposalId: string,
    @Body() dto: UpdateProposalDecisionDto,
  ): Promise<ProposalDecisionResponseDto> {
    const decision =
      await this.decisionRoundApplicationService.setProposalDecision(
        organization,
        event,
        user.userId,
        decisionRoundId,
        proposalId,
        dto,
      );

    return this.toProposalDecisionDto(decision);
  }

  private toDecisionRoundDto(round: DecisionRound): DecisionRoundResponseDto {
    return {
      id: round.id,
      reviewPeriodId: round.reviewPeriodId,
      name: round.name,
      status: round.status,
      openedAt: round.openedAt?.toDate().toISOString() ?? null,
      lockedAt: round.lockedAt?.toDate().toISOString() ?? null,
      createdAt: round.createdAt.toDate().toISOString(),
      updatedAt: round.updatedAt.toDate().toISOString(),
    };
  }

  private toProposalDecisionDto(
    decision: ProposalDecision,
  ): ProposalDecisionResponseDto {
    return {
      proposalId: decision.proposalId,
      decisionRoundId: decision.decisionRoundId,
      status: decision.status,
      internalRationale: decision.internalRationale,
      speakerMessage: decision.speakerMessage,
      revisionNumber: decision.revisionNumber,
      decidedAt: decision.decidedAt.toDate().toISOString(),
    };
  }
}
