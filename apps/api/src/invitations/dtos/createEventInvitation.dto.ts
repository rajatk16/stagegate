import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsEnum, IsString, MaxLength } from 'class-validator';

import { EVENT_ROLES } from '../../events/enums';
import { normalizeInvitationEmail } from '../utils';

export class CreateEventInvitationDto {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? normalizeInvitationEmail(value) : value,
  )
  @IsString()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsEnum(EVENT_ROLES)
  role!: EVENT_ROLES;
}
