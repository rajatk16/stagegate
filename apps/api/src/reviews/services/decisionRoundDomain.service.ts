import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ApplicationException, ErrorCode } from '@/common';

import { DecisionRound } from '../entities';
import { DecisionRoundStatus, ReviewPeriodStatus } from '../enums';

@Injectable()
export class DecisionRoundDomainService {
  assertCanOpen(
    round: DecisionRound,
    reviewPeriodStatus: ReviewPeriodStatus,
  ): void {
    if (round.status !== DecisionRoundStatus.DRAFT) {
      throw new ApplicationException(
        ErrorCode.DECISION_ROUND_INVALID_STATE,
        HttpStatus.CONFLICT,
        'Only a draft decision round can be opened',
      );
    }

    if (
      reviewPeriodStatus !== ReviewPeriodStatus.CLOSED &&
      reviewPeriodStatus !== ReviewPeriodStatus.LOCKED
    ) {
      throw new ApplicationException(
        ErrorCode.DECISION_ROUND_INVALID_STATE,
        HttpStatus.CONFLICT,
        'Close the review period before opening decisions',
      );
    }
  }

  assertCanEditDecision(round: DecisionRound): void {
    if (round.status !== DecisionRoundStatus.OPEN) {
      throw new ApplicationException(
        ErrorCode.DECISION_ROUND_NOT_OPEN,
        HttpStatus.CONFLICT,
        'Decisions can only be changed in an open decision round',
      );
    }
  }

  open(round: DecisionRound, now: Timestamp): DecisionRound {
    return {
      ...round,
      status: DecisionRoundStatus.OPEN,
      openedAt: now,
      updatedAt: now,
    };
  }

  lock(
    round: DecisionRound,
    actorUserId: string,
    now: Timestamp,
  ): DecisionRound {
    if (round.status !== DecisionRoundStatus.OPEN) {
      throw new ApplicationException(
        ErrorCode.DECISION_ROUND_INVALID_STATE,
        HttpStatus.CONFLICT,
        'Only an open decision round can be locked',
      );
    }

    return {
      ...round,
      status: DecisionRoundStatus.LOCKED,
      lockedAt: now,
      lockedBy: actorUserId,
      updatedAt: now,
    };
  }
}
