import { OrganizationResponseDto } from './organizationResponse.dto';

export class MyOrganizationsResponseDto {
  items!: OrganizationResponseDto[];
  nextCursor!: string | null;
}
