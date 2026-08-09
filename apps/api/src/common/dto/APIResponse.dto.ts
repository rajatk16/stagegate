import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class APIResponseDto<T> {
  @ApiProperty({
    description: 'The request ID',
    example: '1234567890',
  })
  @IsString()
  requestId: string;

  @ApiProperty({
    description: 'Whether the request was successful',
    example: true,
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    description: 'The timestamp of the response',
    example: new Date().toISOString(),
  })
  @IsString()
  timestamp: string;

  @ApiProperty({
    description: 'The data of the response',
    example: {},
  })
  data: T;
}
