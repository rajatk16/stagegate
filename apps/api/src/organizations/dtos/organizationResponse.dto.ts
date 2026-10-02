import { OrganizationPermission } from '../types';
import { OrganizationMembershipResponseDto } from './organizationMembershipResponse.dto';

export class OrganizationResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  createdAt!: string;
  updatedAt!: string;
  membership!: OrganizationMembershipResponseDto;
  capabilities!: OrganizationPermission[];
}
