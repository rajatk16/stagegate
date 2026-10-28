import { Transform, TransformFnParams } from 'class-transformer';
import {
  Max,
  Min,
  IsIn,
  IsInt,
  IsEnum,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';

import { EVENT_ROLES } from '../enums';

export class UpdateEventMemberRoleDto {
  @IsEnum(EVENT_ROLES)
  role!: EVENT_ROLES;
}

export class UpdateEventMemberStatusDto {
  @IsIn(['ACTIVE', 'SUSPENDED'])
  status!: 'ACTIVE' | 'SUSPENDED';
}

export class ListEventMembersQueryDto {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' && /^[1-9]\d{0,2}$/.test(value)
      ? Number(value)
      : value,
  )
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  cursor?: string;
}
