import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { Authorized } from '@/swagger';
import { EventPermission, Permissions } from '@/auth';
import { OrganizationContext } from '@/organizations';
import { CurrentEvent, Event, EventContext } from '@/events';

import { ReviewMapper } from '../mappers';
import { ChairScorecardApplicationService } from '../services';
import { ChairScorecardPageResponseDto, ChairScorecardQueryDto } from '../dtos';

@Authorized()
@ApiTags('Chair scorecards')
@OrganizationContext('organizationSlug')
@EventContext('eventSlug')
@Controller(
  '/organizations/:organizationSlug/events/:eventSlug/reviews/periods/:reviewPeriodId/scorecards',
)
export class ChairScorecardsController {
  constructor(
    private readonly chairScorecardApplicationService: ChairScorecardApplicationService,
  ) {}

  @Get()
  @Permissions(EventPermission.REVIEW_SCORECARD_READ)
  @ApiOperation({
    summary: 'List proposal review scorecards for a review period',
  })
  @ApiResponse({
    type: ChairScorecardPageResponseDto,
  })
  async listScorecards(
    @CurrentEvent() event: Event,
    @Param('reviewPeriodId', ParseUUIDPipe) reviewPeriodId: string,
    @Query() query: ChairScorecardQueryDto,
  ): Promise<ChairScorecardPageResponseDto> {
    const page = await this.chairScorecardApplicationService.listScorecards(
      event,
      reviewPeriodId,
      query,
    );

    return {
      items: page.items.map((scorecard) =>
        ReviewMapper.toChairScorecardDto(scorecard),
      ),
      nextCursor: page.nextCursor,
    };
  }
}
