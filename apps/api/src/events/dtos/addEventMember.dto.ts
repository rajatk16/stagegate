import { IsEnum, IsString, Length } from 'class-validator';
import { EVENT_ROLES } from '../enums';

export class AddEventMemberDto {
  @IsString()
  @Length(1, 128)
  uid!: string;

  @IsEnum(EVENT_ROLES)
  role!: EVENT_ROLES;
}
