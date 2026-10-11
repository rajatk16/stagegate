import { IsOptional, IsUUID } from 'class-validator';

export class ListOrganizationInvitationsQueryDto {
  @IsOptional()
  @IsUUID('4')
  cursor?: string;
}
