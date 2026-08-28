import { Timestamp } from 'firebase-admin/firestore';
import { ProposalDecisionStatus } from '../enums';

export class ProposalDecisionRevision {
  id: string;

  decisionId: string;
  eventId: string;
  cfpId: string;
  reviewPeriodId: string;
  decisionRoundId: string;
  proposalId: string;

  revisionNumber: number;
  status: ProposalDecisionStatus;
  internalRationale: string | null;
  speakerMessage: string | null;

  decidedBy: string;
  decidedAt: Timestamp;
  createdAt: Timestamp;
}
