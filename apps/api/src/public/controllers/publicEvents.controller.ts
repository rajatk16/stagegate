import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Header, Param, ParseUUIDPipe } from '@nestjs/common';

import { Public } from '@/auth';

import { PublicCfpDto, PublicEventDto } from '../dtos';
import { PublicEventApplicationService } from '../services';
import { Throttle } from '@nestjs/throttler';

@Public()
@ApiTags('Public')
@Controller('/public/events')
export class PublicEventsController {
  constructor(
    private readonly publicEventApplicationService: PublicEventApplicationService,
  ) {}

  @Get(':eventPublicId')
  @ApiOperation({ summary: 'Get a public event' })
  @ApiResponse({ type: PublicEventDto })
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  async getEvent(
    @Param('eventPublicId', new ParseUUIDPipe({ version: '4' }))
    eventPublicId: string,
  ): Promise<PublicEventDto> {
    return this.publicEventApplicationService.getPublicEvent(eventPublicId);
  }

  @Get(':eventPublicId/cfp')
  @ApiOperation({ summary: 'Get a public CFP' })
  @ApiResponse({ type: PublicCfpDto })
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  async getCfp(
    @Param('eventPublicId', new ParseUUIDPipe({ version: '4' }))
    eventPublicId: string,
  ): Promise<PublicCfpDto> {
    return this.publicEventApplicationService.getPublicCfp(eventPublicId);
  }
}
