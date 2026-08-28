import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';

import { Authorized } from '@/swagger';
import { EventPermission, Permissions } from '@/auth';
import { OrganizationContext } from '@/organizations';
import { CurrentEvent, Event, EventContext } from '@/events';

import { ChairProposalViewMapper } from '../mappers';
import { ChairProposalViewResponseDto } from '../dtos';
import { ChairProposalViewApplicationService } from '../services';

@Authorized()
@ApiTags('Chair proposals')
@OrganizationContext('organizationSlug')
@EventContext('eventSlug')
@Controller(
  '/organizations/:organizationSlug/events/:eventSlug/reviews/periods/:reviewPeriodId/proposals',
)
export class ChairProposalViewController {
  constructor(
    private readonly chairProposalViewApplicationService: ChairProposalViewApplicationService,
  ) {}

  @Get(':proposalId')
  @Permissions(
    EventPermission.REVIEW_SCORECARD_READ,
    EventPermission.PROPOSAL_IDENTITY_READ,
  )
  @ApiOperation({
    summary: 'Get an identity-revealed proposal view for a program chair',
  })
  @ApiResponse({ type: ChairProposalViewResponseDto })
  async getProposalView(
    @CurrentEvent() event: Event,
    @Param('reviewPeriodId', ParseUUIDPipe) reviewPeriodId: string,
    @Param('proposalId', ParseUUIDPipe) proposalId: string,
  ): Promise<ChairProposalViewResponseDto> {
    const view = await this.chairProposalViewApplicationService.getProposalView(
      event,
      reviewPeriodId,
      proposalId,
    );

    return ChairProposalViewMapper.toDto(view.proposal, view.scorecard);
  }
}
