import { FirestoreDataConverter } from 'firebase-admin/firestore';
import { ProposalDecisionRevision } from '../entities';
import { toDate } from '@/common';
import { ProposalDecisionStatus } from '../enums';

export const proposalDecisionRevisionConverter: FirestoreDataConverter<ProposalDecisionRevision> =
  {
    toFirestore: (proposalDecisionRevision: ProposalDecisionRevision) => ({
      ...proposalDecisionRevision,
    }),
    fromFirestore: (snapshot) => {
      const data = snapshot.data();

      return {
        cfpId: data.cfpId as string,
        createdAt: toDate(data.createdAt),
        decidedAt: toDate(data.decidedAt),
        decidedBy: data.decidedBy as string,
        decisionId: data.decisionId as string,
        decisionRoundId: data.decisionRoundId as string,
        eventId: data.eventId as string,
        id: snapshot.id,
        internalRationale: data.internalRationale as string | null,
        proposalId: data.proposalId as string,
        reviewPeriodId: data.reviewPeriodId as string,
        revisionNumber: data.revisionNumber as number,
        status: data.status as ProposalDecisionStatus,
        speakerMessage: data.speakerMessage as string | null,
        updatedAt: toDate(data.updatedAt),
      };
    },
  };
