import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

import { EventRole } from '@/auth';

export class CreateEventMemberDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    enum: EventRole,
  })
  @IsEnum(EventRole)
  @IsNotEmpty()
  role: EventRole;
}
