import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { proposalDecisionConverter } from '../converters';
import { PROPOSAL_DECISIONS_COLLECTION } from '../constants';
import { createProposalDecisionId } from '../utils';

@Injectable()
export class ProposalDecisionRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(PROPOSAL_DECISIONS_COLLECTION)
      .withConverter(proposalDecisionConverter);
  }

  getDocumentReference(decisionRoundId: string, proposalId: string) {
    return this.collection().doc(
      createProposalDecisionId(decisionRoundId, proposalId),
    );
  }

  getByDecisionRoundQuery(decisionRoundId: string) {
    return this.collection().where('decisionRoundId', '==', decisionRoundId);
  }
}
