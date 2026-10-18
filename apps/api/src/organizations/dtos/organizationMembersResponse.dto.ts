import { ORGANIZATION_MEMBERSHIP_STATUS } from '../enums';
import { OrganizationMembershipResponseDto } from './organizationMembershipResponse.dto';

export class OrganizationMemberResponseDto extends OrganizationMembershipResponseDto {
  status!: ORGANIZATION_MEMBERSHIP_STATUS;
  createdAt!: string;
  updatedAt!: string;
}

export class OrganizationTeamMemberResponseDto extends OrganizationMemberResponseDto {
  displayName!: string | null;
  email!: string | null;
  actions!: {
    suspend: boolean;
    reactivate: boolean;
    transferOwnership: boolean;
  };
}

export class OrganizationMembersResponseDto {
  items!: OrganizationTeamMemberResponseDto[];
  nextCursor!: string | null;
}
