import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUrl,
  IsEnum,
  IsUUID,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

import { EventRole } from '@/auth';

import { EventMembershipStatus } from '../enums';

export class EventMemberDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string | null;

  @ApiProperty()
  @IsEnum(EventRole)
  @IsNotEmpty()
  role: EventRole;

  @ApiProperty()
  @IsEnum(EventMembershipStatus)
  @IsNotEmpty()
  status: EventMembershipStatus;

  @ApiProperty()
  @IsNotEmpty()
  joinedAt: string;

  @ApiProperty()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty()
  @IsNotEmpty()
  updatedAt: string;
}
