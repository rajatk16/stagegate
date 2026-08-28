import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';
import { ApplicationException, ErrorCode } from '@/common';
import { ProposalRepository, ProposalStatus } from '@/submissions';
import { Event, EventRepository, EventsDomainService } from '@/events';
import {
  Organization,
  OrganizationLifecyclePolicyService,
} from '@/organizations';

import { DecisionRoundStatus } from '../enums';
import { DecisionRoundDomainService } from './decisionRoundDomain.service';
import { CreateDecisionRoundDto, UpdateProposalDecisionDto } from '../dtos';
import { ProposalReviewScorecardProjectionService } from './proposalReviewScorecardProjection.service';
import { ProposalDecisionRevisionRepository } from '../repositories/proposalDecisionRevision.repository';
import {
  ReviewPeriodRepository,
  DecisionRoundRepository,
  ProposalDecisionRepository,
} from '../repositories';
import {
  ReviewPeriod,
  DecisionRound,
  ProposalDecision,
  ProposalDecisionRevision,
} from '../entities';

@Injectable()
export class DecisionRoundApplicationService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly firebaseService: FirebaseService,
    private readonly proposalRepository: ProposalRepository,
    private readonly eventsDomainService: EventsDomainService,
    private readonly reviewPeriodRepository: ReviewPeriodRepository,
    private readonly decisionRoundRepository: DecisionRoundRepository,
    private readonly decisionRoundDomainService: DecisionRoundDomainService,
    private readonly proposalDecisionRepository: ProposalDecisionRepository,
    private readonly organizationLifecyclePolicyService: OrganizationLifecyclePolicyService,
    private readonly proposalDecisionRevisionRepository: ProposalDecisionRevisionRepository,
    private readonly proposalReviewScorecardProjectionService: ProposalReviewScorecardProjectionService,
  ) {}

  async setProposalDecision(
    organization: Organization,
    event: Event,
    actorUserId: string,
    decisionRoundId: string,
    proposalId: string,
    dto: UpdateProposalDecisionDto,
  ): Promise<ProposalDecision> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const roundRef =
          this.decisionRoundRepository.getDocumentReference(decisionRoundId);

        const proposalRef =
          this.proposalRepository.getDocumentReference(proposalId);

        const [roundSnapshot, proposalSnapshot] = await Promise.all([
          transaction.get(roundRef),
          transaction.get(proposalRef),
        ]);

        if (!roundSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.DECISION_ROUND_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Decision round not found',
          );
        }

        if (!proposalSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found',
          );
        }

        const round = roundSnapshot.data()!;
        const proposal = proposalSnapshot.data()!;

        if (
          round.eventId !== event.id ||
          proposal.eventId !== event.id ||
          proposal.cfpId !== round.cfpId ||
          (proposal.status !== ProposalStatus.SUBMITTED &&
            proposal.status !== ProposalStatus.WITHDRAWN)
        ) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found',
          );
        }

        this.decisionRoundDomainService.assertCanEditDecision(round);

        const decisionRef =
          this.proposalDecisionRepository.getDocumentReference(
            round.id,
            proposal.id,
          );

        const decisionSnapshot = await transaction.get(decisionRef);
        const existingDecision = decisionSnapshot.exists
          ? decisionSnapshot.data()!
          : null;

        const now = Timestamp.now();
        const revisionNumber = (existingDecision?.revisionNumber ?? 0) + 1;

        const decision: ProposalDecision = {
          id: decisionRef.id,
          eventId: event.id,
          cfpId: round.cfpId,
          reviewPeriodId: round.reviewPeriodId,
          decisionRoundId: round.id,
          proposalId: proposal.id,

          status: dto.status,
          internalRationale: dto.internalRationale?.trim() || null,
          speakerMessage: dto.speakerMessage?.trim() || null,

          revisionNumber,
          decidedBy: actorUserId,
          decidedAt: now,
          createdAt: existingDecision?.createdAt ?? now,
          updatedAt: now,
        };

        const revisionRef =
          this.proposalDecisionRevisionRepository.getDocumentReference(
            decision.id,
            revisionNumber,
          );

        const revision: ProposalDecisionRevision = {
          id: revisionRef.id,
          decisionId: decision.id,
          eventId: decision.eventId,
          cfpId: decision.cfpId,
          reviewPeriodId: decision.reviewPeriodId,
          decisionRoundId: decision.decisionRoundId,
          proposalId: decision.proposalId,

          revisionNumber: decision.revisionNumber,
          status: decision.status,
          internalRationale: decision.internalRationale,
          speakerMessage: decision.speakerMessage,

          decidedBy: actorUserId,
          decidedAt: now,
          createdAt: now,
        };

        /*
         * This also creates a missing scorecard for an unassigned proposal.
         * That is necessary for UNDECIDED filtering and coverage reporting.
         */
        const scorecard =
          await this.proposalReviewScorecardProjectionService.buildInTransaction(
            {
              transaction,
              proposal,
              reviewPeriod: {
                id: round.reviewPeriodId,
                eventId: round.eventId,
                cfpId: round.cfpId,
              } as ReviewPeriod,
              now,
            },
          );

        const nextScorecard = {
          ...scorecard,
          decisionStatus: decision.status,
          updatedAt: now,
        };

        /*
         * All reads above occur before the first write.
         */
        transaction.set(decisionRef, decision);
        transaction.create(revisionRef, revision);

        this.proposalReviewScorecardProjectionService.saveInTransaction(
          transaction,
          nextScorecard,
        );

        return decision;
      },
    );
  }

  async createRound(
    organization: Organization,
    event: Event,
    actorUserId: string,
    dto: CreateDecisionRoundDto,
  ): Promise<DecisionRound> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);

        const reviewPeriodRef =
          this.reviewPeriodRepository.getDocumentReference(dto.reviewPeriodId);

        const activeRoundsQuery =
          this.decisionRoundRepository.getByReviewPeriodQuery(
            dto.reviewPeriodId,
          );

        const [eventSnapshot, reviewPeriodSnapshot, activeRoundsSnapshot] =
          await Promise.all([
            transaction.get(eventRef),
            transaction.get(reviewPeriodRef),
            transaction.get(activeRoundsQuery),
          ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        this.eventsDomainService.assertEditable(eventSnapshot.data()!);

        if (!reviewPeriodSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review period not found',
          );
        }

        const reviewPeriod = reviewPeriodSnapshot.data()!;

        if (reviewPeriod.eventId !== event.id) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review period not found',
          );
        }

        /*
         * One round may be active at a time for a review period. A new round
         * is allowed only after the previous one is locked.
         */
        const hasActiveRound = activeRoundsSnapshot.docs.some((document) => {
          const round = document.data();

          return (
            round.status === DecisionRoundStatus.DRAFT ||
            round.status === DecisionRoundStatus.OPEN
          );
        });

        if (hasActiveRound) {
          throw new ApplicationException(
            ErrorCode.DECISION_ROUND_ALREADY_EXISTS,
            HttpStatus.CONFLICT,
            'An active decision round already exists for this review period',
          );
        }

        const now = Timestamp.now();

        const round: DecisionRound = {
          id: randomUUID(),

          eventId: event.id,
          cfpId: reviewPeriod.cfpId,
          reviewPeriodId: reviewPeriod.id,

          name: dto.name.trim(),
          status: DecisionRoundStatus.DRAFT,

          createdBy: actorUserId,
          createdAt: now,
          updatedAt: now,

          openedAt: null,
          lockedAt: null,
          lockedBy: null,
        };

        transaction.create(
          this.decisionRoundRepository.getDocumentReference(round.id),
          round,
        );

        return round;
      },
    );
  }

  async listRounds(event: Event): Promise<DecisionRound[]> {
    const snapshot = await this.decisionRoundRepository
      .getByEventQuery(event.id)
      .get();

    return snapshot.docs.map((document) => document.data());
  }

  async openRound(
    organization: Organization,
    event: Event,
    decisionRoundId: string,
  ): Promise<DecisionRound> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);

        const roundRef =
          this.decisionRoundRepository.getDocumentReference(decisionRoundId);

        const [eventSnapshot, roundSnapshot] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(roundRef),
        ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        this.eventsDomainService.assertEditable(eventSnapshot.data()!);

        if (!roundSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.DECISION_ROUND_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Decision round not found',
          );
        }

        const round = roundSnapshot.data()!;

        if (round.eventId !== event.id) {
          throw new ApplicationException(
            ErrorCode.DECISION_ROUND_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Decision round not found',
          );
        }

        const reviewPeriodRef =
          this.reviewPeriodRepository.getDocumentReference(
            round.reviewPeriodId,
          );

        const reviewPeriodSnapshot = await transaction.get(reviewPeriodRef);

        if (!reviewPeriodSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review period not found',
          );
        }

        const reviewPeriod = reviewPeriodSnapshot.data()!;

        if (
          reviewPeriod.eventId !== event.id ||
          reviewPeriod.cfpId !== round.cfpId
        ) {
          throw new ApplicationException(
            ErrorCode.DECISION_ROUND_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Decision round not found',
          );
        }

        this.decisionRoundDomainService.assertCanOpen(
          round,
          reviewPeriod.status,
        );

        const openedRound = this.decisionRoundDomainService.open(
          round,
          Timestamp.now(),
        );

        transaction.set(roundRef, openedRound);

        return openedRound;
      },
    );
  }

  async lockRound(
    organization: Organization,
    event: Event,
    actorUserId: string,
    decisionRoundId: string,
  ): Promise<DecisionRound> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);

        const roundRef =
          this.decisionRoundRepository.getDocumentReference(decisionRoundId);

        const [eventSnapshot, roundSnapshot] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(roundRef),
        ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        this.eventsDomainService.assertEditable(eventSnapshot.data()!);

        if (!roundSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.DECISION_ROUND_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Decision round not found',
          );
        }

        const round = roundSnapshot.data()!;

        if (round.eventId !== event.id) {
          throw new ApplicationException(
            ErrorCode.DECISION_ROUND_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Decision round not found',
          );
        }

        const lockedRound = this.decisionRoundDomainService.lock(
          round,
          actorUserId,
          Timestamp.now(),
        );

        transaction.set(roundRef, lockedRound);

        return lockedRound;
      },
    );
  }
}
