import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Get, HttpCode, Controller, HttpStatus } from '@nestjs/common';

import { Public } from '@/auth';
import { ApplicationException, ErrorCode } from '@/common';

import { HealthService } from '../services';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get health status of the application',
    description:
      'Confirms that the API process is running. Does not check external dependencies.',
  })
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Confirms that the API is accepting traffic and Firestore is reachable.',
  })
  async ready() {
    const ready = await this.healthService.isReady();

    if (!ready) {
      throw new ApplicationException(
        ErrorCode.SERVICE_UNAVAILABLE,
        HttpStatus.SERVICE_UNAVAILABLE,
        'Service unavailable',
      );
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
