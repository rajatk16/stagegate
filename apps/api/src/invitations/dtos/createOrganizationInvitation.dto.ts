import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsEnum, IsString, MaxLength } from 'class-validator';

import { normalizeInvitationEmail } from '../utils/invitationToken.util';
import { INVITABLE_ORGANIZATION_ROLES } from '../models/organizationInvitation.model';

export class CreateOrganizationInvitationDto {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? normalizeInvitationEmail(value) : value,
  )
  @IsString()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsEnum(INVITABLE_ORGANIZATION_ROLES)
  role!: INVITABLE_ORGANIZATION_ROLES;
}
