import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { createProposalDecisionRevisionId } from '../utils';
import { proposalDecisionRevisionConverter } from '../converters';
import { PROPOSAL_DECISION_REVISIONS_COLLECTION } from '../constants';

@Injectable()
export class ProposalDecisionRevisionRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(PROPOSAL_DECISION_REVISIONS_COLLECTION)
      .withConverter(proposalDecisionRevisionConverter);
  }

  getDocumentReference(proposalDecisionId: string, revisionNumber: number) {
    return this.collection().doc(
      createProposalDecisionRevisionId(proposalDecisionId, revisionNumber),
    );
  }
}
