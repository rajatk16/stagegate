import { Controller, Get } from '@nestjs/common';
import {
  type HealthResponse,
  healthResponseSchema,
} from '@stagegate/contracts';

@Controller()
export class AppController {
  @Get('health')
  health(): HealthResponse {
    return healthResponseSchema.parse({ status: 'ok' });
  }
}
