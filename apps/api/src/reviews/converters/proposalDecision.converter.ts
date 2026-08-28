import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate } from '@/common';

import { ProposalDecision } from '../entities';
import { ProposalDecisionStatus } from '../enums';

export const proposalDecisionConverter: FirestoreDataConverter<ProposalDecision> =
  {
    toFirestore: (proposalDecision: ProposalDecision) => ({
      ...proposalDecision,
    }),
    fromFirestore: (snapshot) => {
      const data = snapshot.data();

      return {
        cfpId: data.cfpId as string,
        createdAt: toDate(data.createdAt),
        decidedAt: toDate(data.decidedAt),
        decidedBy: data.decidedBy as string,
        decisionRoundId: data.decisionRoundId as string,
        eventId: data.eventId as string,
        id: snapshot.id,
        internalRationale: data.internalRationale as string | null,
        proposalId: data.proposalId as string,
        reviewPeriodId: data.reviewPeriodId as string,
        revisionNumber: data.revisionNumber as number,
        speakerMessage: data.speakerMessage as string | null,
        status: data.status as ProposalDecisionStatus,
        updatedAt: toDate(data.updatedAt),
      };
    },
  };
