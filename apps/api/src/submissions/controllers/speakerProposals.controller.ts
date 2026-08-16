import { Authorized } from '@/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Get,
  Body,
  Post,
  Param,
  Patch,
  Controller,
  ParseUUIDPipe,
} from '@nestjs/common';

import { type AuthenticatedUser, CurrentUser } from '@/auth';

import { ProposalApplicationService } from '../services';
import {
  ProposalDetailsDto,
  ProposalSummaryDto,
  CreateProposalDraftDto,
  UpdateProposalDraftDto,
  SubmitProposalDto,
} from '../dtos';

@Authorized()
@ApiTags('Speaker workspace')
@Controller('/speaker/events/:eventPublicId/proposals')
export class SpeakerProposalsController {
  constructor(
    private readonly proposalApplicationService: ProposalApplicationService,
  ) {}

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @ApiOperation({ summary: 'Create a proposal draft' })
  @ApiBody({ type: CreateProposalDraftDto })
  @ApiResponse({ type: ProposalDetailsDto })
  async createDraft(
    @Param('eventPublicId', new ParseUUIDPipe({ version: '4' }))
    eventPublicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProposalDraftDto,
  ): Promise<ProposalDetailsDto> {
    return this.proposalApplicationService.createDraft(
      eventPublicId,
      user.userId,
      dto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List my proposals for a CFP' })
  @ApiResponse({ type: [ProposalSummaryDto] })
  async listMine(
    @Param('eventPublicId', new ParseUUIDPipe({ version: '4' }))
    eventPublicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProposalSummaryDto[]> {
    return this.proposalApplicationService.listMine(eventPublicId, user.userId);
  }

  @Get(':proposalId')
  @ApiOperation({ summary: 'Get a proposal details' })
  @ApiResponse({ type: ProposalDetailsDto })
  async getDetails(
    @Param('eventPublicId', new ParseUUIDPipe({ version: '4' }))
    eventPublicId: string,
    @Param('proposalId', new ParseUUIDPipe({ version: '4' }))
    proposalId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProposalDetailsDto> {
    return this.proposalApplicationService.getMine(
      eventPublicId,
      proposalId,
      user.userId,
    );
  }

  @Patch(':proposalId')
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @ApiOperation({ summary: 'Update a proposal details' })
  @ApiBody({ type: UpdateProposalDraftDto })
  @ApiResponse({ type: ProposalDetailsDto })
  async updateDetails(
    @Param('eventPublicId', new ParseUUIDPipe({ version: '4' }))
    eventPublicId: string,
    @Param('proposalId', new ParseUUIDPipe({ version: '4' }))
    proposalId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProposalDraftDto,
  ): Promise<ProposalDetailsDto> {
    return this.proposalApplicationService.updateProposal(
      eventPublicId,
      proposalId,
      user.userId,
      dto,
    );
  }

  @Post(':proposalId/submit')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Submit a proposal' })
  @ApiBody({ type: SubmitProposalDto })
  @ApiResponse({ type: ProposalDetailsDto })
  async submitProposal(
    @Param('eventPublicId', new ParseUUIDPipe({ version: '4' }))
    eventPublicId: string,
    @Param('proposalId', new ParseUUIDPipe({ version: '4' }))
    proposalId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitProposalDto,
  ): Promise<ProposalDetailsDto> {
    return this.proposalApplicationService.submitProposal(
      eventPublicId,
      proposalId,
      user.userId,
      dto,
    );
  }

  @Post(':proposalId/withdraw')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Withdraw a proposal' })
  @ApiResponse({ type: ProposalDetailsDto })
  async withdrawProposal(
    @Param('eventPublicId', new ParseUUIDPipe({ version: '4' }))
    eventPublicId: string,
    @Param('proposalId', new ParseUUIDPipe({ version: '4' }))
    proposalId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProposalDetailsDto> {
    return this.proposalApplicationService.withdrawProposal(
      eventPublicId,
      proposalId,
      user.userId,
    );
  }
}
