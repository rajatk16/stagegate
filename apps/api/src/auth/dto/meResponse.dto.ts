import { ApiProperty } from '@nestjs/swagger';
import { Timestamp } from 'firebase-admin/firestore';
import {
  IsUrl,
  IsEnum,
  IsUUID,
  IsArray,
  IsEmail,
  IsString,
  IsOptional,
} from 'class-validator';

import { UserStatus } from '@/users/enums';

export class MeResponseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  displayName: string;

  @ApiProperty({
    nullable: true,
  })
  @IsUrl()
  @IsOptional()
  photoUrl?: string | null;

  @ApiProperty()
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty()
  createdAt: Timestamp;

  @ApiProperty({
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  organizations: string[];
}
