import { Timestamp } from 'firebase-admin/firestore';

import { ProposalDecisionStatus } from '../enums';

export class ProposalDecision {
  id: string;

  eventId: string;
  cfpId: string;
  reviewPeriodId: string;
  decisionRoundId: string;
  proposalId: string;

  status: ProposalDecisionStatus;

  internalRationale: string | null;

  speakerMessage: string | null;

  revisionNumber: number;

  decidedBy: string;
  decidedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
