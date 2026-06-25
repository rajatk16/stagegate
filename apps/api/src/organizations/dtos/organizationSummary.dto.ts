import { ApiProperty } from '@nestjs/swagger';

export class OrganizationSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  logoUrl?: string | null;
}
