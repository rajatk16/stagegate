import { PartialType } from '@nestjs/swagger';

import { CreateProposalDraftDto } from './createProposalDraft.dto';

export class UpdateProposalDraftDto extends PartialType(
  CreateProposalDraftDto,
) {}
