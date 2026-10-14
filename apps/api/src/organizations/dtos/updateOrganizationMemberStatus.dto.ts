import { IsEnum, IsNotEmpty } from 'class-validator';
import { ORGANIZATION_MEMBERSHIP_STATUS } from '../enums';

export class UpdateOrganizationMemberStatusDto {
  @IsEnum(ORGANIZATION_MEMBERSHIP_STATUS)
  @IsNotEmpty()
  status: ORGANIZATION_MEMBERSHIP_STATUS;
}
