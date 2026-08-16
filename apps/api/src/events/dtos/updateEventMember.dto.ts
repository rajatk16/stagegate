import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { EventRole } from '@/auth';

export class UpdateEventMemberDto {
  @ApiProperty({
    enum: EventRole,
  })
  @IsEnum(EventRole)
  @IsNotEmpty()
  role: EventRole;
}
