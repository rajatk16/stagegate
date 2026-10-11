import { SkipThrottle } from '@nestjs/throttler';
import { Controller, Get, Header, HttpStatus } from '@nestjs/common';

import { Public } from '../../auth/decorators';
import { ReadinessService } from '../services';
import { ApiException } from '../../common/exceptions';

@Controller('health')
@SkipThrottle({ ip: true, user: true })
export class HealthController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Public()
  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Public()
  @Get('ready')
  @Header('Cache-Control', 'no-store')
  async ready(): Promise<{ status: 'ready' }> {
    if (!(await this.readinessService.isReady())) {
      throw new ApiException(
        HttpStatus.SERVICE_UNAVAILABLE,
        'SERVICE_NOT_READY',
        'Service is temporarily unavailable.',
      );
    }

    return { status: 'ready' };
  }
}
