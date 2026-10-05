import { OrganizationMembershipResponseDto } from './organizationMembershipResponse.dto';

export class OrganizationMemberResponseDto extends OrganizationMembershipResponseDto {
  status!: 'ACTIVE';
  createdAt!: string;
  updatedAt!: string;
}

export class OrganizationTeamMemberResponseDto extends OrganizationMemberResponseDto {
  displayName!: string | null;
  email!: string | null;
}

export class OrganizationMembersResponseDto {
  items!: OrganizationTeamMemberResponseDto[];
  nextCursor!: string | null;
}
