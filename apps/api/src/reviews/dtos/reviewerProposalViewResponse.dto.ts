import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ProposalFormat } from '@/submissions';

export class ReviewerProposalViewResponseDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  abstract: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({ enum: ProposalFormat })
  format: ProposalFormat;

  @ApiPropertyOptional()
  durationMinutes: number | null;

  @ApiProperty()
  language: string;
}
