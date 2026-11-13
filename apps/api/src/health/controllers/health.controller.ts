import { Controller, Get, Header, HttpStatus, Res, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RawResponse } from '../../common/decorators/rawResponse.decorator';
import { HealthResponseDto } from '../dtos/healthResponse.dto';
import { HealthService } from '../services/health.service';

import type { Response } from 'express';

@ApiTags('Health')
@RawResponse()
@Controller({
  path: 'health',
  version: VERSION_NEUTRAL,
})
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('live')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Check application liveness',
  })
  @ApiOkResponse({
    type: HealthResponseDto,
  })
  getLiveness(): HealthResponseDto {
    return this.health.getLiveness();
  }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Check application readiness',
  })
  @ApiOkResponse({
    type: HealthResponseDto,
  })
  getReadiness(@Res({ passthrough: true }) response: Response): HealthResponseDto {
    const readiness = this.health.getReadiness();

    response.status(readiness.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);

    return readiness;
  }
}
