import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseMetaDto {
  @ApiProperty({
    format: 'uuid',
    example: '77c49c36-0b37-4e54-8c7d-7607310d6a82',
  })
  requestId!: string;

  @ApiProperty({
    format: 'date-time',
    example: '2026-11-13T12:00:00.)))Z',
  })
  timestamp!: string;
}

export class ValidationErrorDetailDto {
  @ApiProperty({
    example: 'name',
  })
  field!: string;

  @ApiProperty({
    type: [String],
  })
  messages!: string[];
}

export class ApiErrorDto {
  @ApiProperty({
    example: 'VALIDATION_ERROR',
  })
  code!: string;

  @ApiProperty({
    example: 'Request validation failed.',
  })
  message!: string;

  @ApiPropertyOptional({
    type: [ValidationErrorDetailDto],
  })
  details?: ValidationErrorDetailDto[];
}

export class ApiErrorResponseDto {
  @ApiProperty({
    type: Boolean,
    enum: [false],
  })
  success!: false;

  @ApiProperty({
    type: ApiErrorDto,
  })
  error!: ApiErrorDto;

  @ApiProperty({
    type: ResponseMetaDto,
  })
  meta!: ResponseMetaDto;
}

export class ApiSuccessResponseDto {
  @ApiProperty({
    type: Boolean,
    enum: [true],
  })
  success!: true;

  @ApiProperty({
    type: ResponseMetaDto,
  })
  meta!: ResponseMetaDto;
}
