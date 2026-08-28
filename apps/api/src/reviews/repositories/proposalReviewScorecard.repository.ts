import { HttpStatus, Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { createProposalReviewScorecardId } from '../utils';
import { proposalReviewScorecardConverter } from '../converters';
import { PROPOSAL_REVIEW_SCORECARDS_COLLECTION } from '../constants';
import { ProposalReviewScorecard } from '../entities';
import { ChairScorecardQueryDto } from '../dtos';
import { FieldPath } from 'firebase-admin/firestore';
import { ApplicationException, ErrorCode } from '@/common';

type ChairScorecardPage = {
  items: ProposalReviewScorecard[];
  nextCursor: string | null;
};

@Injectable()
export class ProposalReviewScorecardRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(PROPOSAL_REVIEW_SCORECARDS_COLLECTION)
      .withConverter(proposalReviewScorecardConverter);
  }

  getDocumentReference(reviewPeriodId: string, proposalId: string) {
    return this.collection().doc(
      createProposalReviewScorecardId(reviewPeriodId, proposalId),
    );
  }

  getDocumentReferenceById(scorecardId: string) {
    return this.collection().doc(scorecardId);
  }

  getByReviewPeriodQuery(reviewPeriodId: string) {
    return this.collection().where('reviewPeriodId', '==', reviewPeriodId);
  }

  getByProposalQuery(proposalId: string) {
    return this.collection().where('proposalId', '==', proposalId);
  }

  async findByReviewPeriodAndProposal(
    reviewPeriodId: string,
    proposalId: string,
  ) {
    const snapshot = await this.getDocumentReference(
      reviewPeriodId,
      proposalId,
    ).get();

    return snapshot.exists ? snapshot.data()! : null;
  }

  async findChairScorecardPage(
    reviewPeriodId: string,
    filters: ChairScorecardQueryDto,
  ): Promise<ChairScorecardPage> {
    const pageSize = Math.min(Math.max(filters.limit, 1), 50);

    let query = this.collection().where('reviewPeriodId', '==', reviewPeriodId);

    if (filters.trackId) {
      query = query.where('trackId', '==', filters.trackId);
    }

    if (filters.format) {
      query = query.where('proposalFormat', '==', filters.format);
    }

    if (filters.status) {
      query = query.where('proposalStatus', '==', filters.status);
    }

    if (filters.coverageStatus) {
      query = query.where('coverageStatus', '==', filters.coverageStatus);
    }

    if (filters.conflictState) {
      query = query.where('conflictState', '==', filters.conflictState);
    }

    if (filters.decisionStatus) {
      query = query.where('decisionStatus', '==', filters.decisionStatus);
    }

    if (filters.minimumScore !== undefined) {
      query = query.where('weightedAverageScore', '>=', filters.minimumScore);
    }

    if (filters.maximumScore !== undefined) {
      query = query.where('weightedAverageScore', '<=', filters.maximumScore);
    }

    query = query
      .orderBy('weightedAverageScore', 'desc')
      .orderBy(FieldPath.documentId(), 'desc')
      .limit(pageSize + 1);

    if (filters.cursor) {
      const cursorSnapshot = await this.getDocumentReferenceById(
        filters.cursor,
      ).get();

      if (
        !cursorSnapshot.exists ||
        cursorSnapshot.data()!.reviewPeriodId !== reviewPeriodId
      ) {
        throw new ApplicationException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
          'Invalid scorecard cursor',
        );
      }

      query = query.startAfter(cursorSnapshot);
    }

    const snapshot = await query.get();

    const items = snapshot.docs.slice(0, pageSize).map((doc) => doc.data());

    return {
      items,
      nextCursor:
        snapshot.docs.length > pageSize ? (items.at(-1)?.id ?? null) : null,
    };
  }
}
