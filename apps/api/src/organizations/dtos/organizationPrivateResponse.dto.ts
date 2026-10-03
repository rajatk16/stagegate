import { OrganizationPermission } from '../types';
import { OrganizationPublicResponseDto } from './organizationPublicResponse.dto';
import { OrganizationMembershipResponseDto } from './organizationMembershipResponse.dto';

export class OrganizationPrivateResponseDto extends OrganizationPublicResponseDto {
  createdAt!: string;
  updatedAt!: string;
  membership!: OrganizationMembershipResponseDto;
  capabilities!: OrganizationPermission[];
}
