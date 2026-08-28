import { ProposalDecisionStatus } from '../enums';

export class ProposalDecisionResponseDto {
  proposalId: string;
  decisionRoundId: string;
  status: ProposalDecisionStatus;
  speakerMessage: string | null;
  internalRationale: string | null;
  revisionNumber: number;
  decidedAt: string;
}
