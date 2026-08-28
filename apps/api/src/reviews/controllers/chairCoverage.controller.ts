import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { Authorized } from '@/swagger';
import { EventPermission, Permissions } from '@/auth';
import { OrganizationContext } from '@/organizations';
import { CurrentEvent, Event, EventContext } from '@/events';

import { ChairCoverageApplicationService } from '../services';
import { ChairCoverageQueryDto, ChairCoverageResponseDto } from '../dtos';

@Authorized()
@ApiTags('Chair Coverage')
@OrganizationContext('organizationSlug')
@EventContext('eventSlug')
@Controller(
  '/organizations/:organizationSlug/events/:eventSlug/reviews/periods/:reviewPeriodId/coverage',
)
export class ChairCoverageController {
  constructor(
    private readonly chairCoverageApplicationService: ChairCoverageApplicationService,
  ) {}

  @Get()
  @Permissions(EventPermission.REVIEW_COVERAGE_READ)
  @ApiOperation({
    summary: 'Get reviewer workload and proposal-review converage alerts',
  })
  @ApiResponse({
    type: ChairCoverageResponseDto,
  })
  async getCoverage(
    @CurrentEvent() event: Event,
    @Param('reviewPeriodId', ParseUUIDPipe) reviewPeriodId: string,
    @Query() query: ChairCoverageQueryDto,
  ) {
    return this.chairCoverageApplicationService.getCoverage(
      event,
      reviewPeriodId,
      query,
    );
  }
}
