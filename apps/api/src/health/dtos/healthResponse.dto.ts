import { ApiProperty } from '@nestjs/swagger';

import { HealthResponse, type HealthStatus } from '@stagegate/contracts';

export class HealthResponseDto implements HealthResponse {
  @ApiProperty({
    enum: ['ok', 'unavailable'],

    example: 'ok',
  })
  status!: HealthStatus;

  @ApiProperty({
    type: String,

    format: 'date-time',

    example: '2026-11-16T10:00:00.000Z',
  })
  timestamp!: string;
}
