import { IsString, MaxLength, MinLength } from 'class-validator';

import { OrganizationMemberResponseDto } from './organizationMembersResponse.dto';

export class TransferOrganizationOwnershipDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  targetUid!: string;
}

export class TransferOrganizationOwnershipResponseDto {
  organizationId!: string;
  previousOwner!: OrganizationMemberResponseDto;
  newOwner!: OrganizationMemberResponseDto;
}
