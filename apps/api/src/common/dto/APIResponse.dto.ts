import { ApiProperty } from '@nestjs/swagger';

export class APIResponseDto<T> {
  @ApiProperty({
    description: 'Whether the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'The timestamp of the response',
    example: new Date().toISOString(),
  })
  timestamp: string;

  @ApiProperty({
    description: 'The data of the response',
    example: {},
  })
  data: T;
}
