import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';
import { CfpRepository, CfpStatus } from '@/cfps';
import { ApplicationException, ErrorCode } from '@/common';
import { Event, EventRepository, EventsDomainService } from '@/events';
import {
  Organization,
  OrganizationLifecyclePolicyService,
} from '@/organizations';

import { ReviewPeriodStatus } from '../enums';
import { ReviewPeriodDomainService } from './reviewPeriodDomain.service';
import { ReviewRubricDomainService } from './reviewRubricDomain.service';
import { ReviewCriterion, ReviewPeriod, ReviewRubric } from '../entities';
import {
  ReviewPeriodRepository,
  ReviewRubricRepository,
} from '../repositories';
import {
  CreateReviewPeriodDto,
  UpdateReviewPeriodDto,
  UpsertReviewRubricDto,
} from '../dtos';

@Injectable()
export class ReviewConfigurationApplicationService {
  constructor(
    private readonly cfpRepository: CfpRepository,
    private readonly firebaseService: FirebaseService,
    private readonly eventRepository: EventRepository,
    private readonly eventsDomainService: EventsDomainService,
    private readonly reviewPeriodRepository: ReviewPeriodRepository,
    private readonly reviewRubricRepository: ReviewRubricRepository,
    private readonly reviewRubricDomainService: ReviewRubricDomainService,
    private readonly reviewPeriodDomainService: ReviewPeriodDomainService,
    private readonly organizationLifecyclePolicyService: OrganizationLifecyclePolicyService,
  ) {}

  async getRubric(event: Event): Promise<ReviewRubric> {
    const rubric = await this.reviewRubricRepository.findByCfpId(event.id);

    if (!rubric || rubric.eventId !== event.id) {
      throw new ApplicationException(
        ErrorCode.REVIEW_RUBRIC_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Review rubric not found',
      );
    }

    return rubric;
  }

  async upsertRubric(
    organization: Organization,
    event: Event,
    actorUserId: string,
    dto: UpsertReviewRubricDto,
  ): Promise<ReviewRubric> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);
        const cfpRef = this.cfpRepository.getDocumentReference(event.id);
        const rubricRef = this.reviewRubricRepository.getDocumentReference(
          event.id,
        );

        const openPeriodQuery = this.reviewPeriodRepository.getOpenByCfpQuery(
          event.id,
        );

        const [eventSnapshot, cfpSnapshot, rubricSnapshot, openPeriodSnapshot] =
          await Promise.all([
            transaction.get(eventRef),
            transaction.get(cfpRef),
            transaction.get(rubricRef),
            transaction.get(openPeriodQuery),
          ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        this.eventsDomainService.assertEditable(eventSnapshot.data()!);

        if (!cfpSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.CFP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'No CFP found for this event',
          );
        }

        if (!openPeriodSnapshot.empty) {
          throw new ApplicationException(
            ErrorCode.REVIEW_RUBRIC_NOT_FOUND,
            HttpStatus.CONFLICT,
            'Close the active review period before changing the rubric',
          );
        }

        const existingRubric = rubricSnapshot.exists
          ? rubricSnapshot.data()!
          : null;

        const criteria = this.buildCriteria(dto, existingRubric);

        this.reviewRubricDomainService.assertValidCriteria(criteria);

        const now = Timestamp.now();

        const rubric: ReviewRubric = {
          id: event.id,
          eventId: event.id,
          cfpId: event.id,
          version: existingRubric ? existingRubric.version + 1 : 1,
          criteria,
          createdBy: existingRubric?.createdBy ?? actorUserId,
          createdAt: existingRubric?.createdAt ?? now,
          updatedAt: now,
        };

        transaction.set(rubricRef, rubric);

        return rubric;
      },
    );
  }

  async listPeriod(event: Event): Promise<ReviewPeriod[]> {
    return this.reviewPeriodRepository.findByCfpId(event.id);
  }

  async createPeriod(
    organization: Organization,
    event: Event,
    actorUserId: string,
    dto: CreateReviewPeriodDto,
  ): Promise<ReviewPeriod> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    const opensAt = dto.opensAt
      ? Timestamp.fromDate(new Date(dto.opensAt))
      : null;
    const closesAt = dto.closesAt
      ? Timestamp.fromDate(new Date(dto.closesAt))
      : null;

    this.reviewPeriodDomainService.assertValidSchedule(opensAt, closesAt);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);
        const cfpRef = this.cfpRepository.getDocumentReference(event.id);
        const rubricRef = this.reviewRubricRepository.getDocumentReference(
          event.id,
        );

        const [eventSnapshot, cfpSnapshot, rubricSnapshot] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(cfpRef),
          transaction.get(rubricRef),
        ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        this.eventsDomainService.assertEditable(eventSnapshot.data()!);

        if (!cfpSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.CFP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'No CFP found for this event',
          );
        }

        if (!rubricSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_RUBRIC_NOT_FOUND,
            HttpStatus.CONFLICT,
            'Create a review rubric before creating a review period',
          );
        }

        const now = Timestamp.now();
        const reviewPeriod: ReviewPeriod = {
          id: randomUUID(),
          eventId: event.id,
          cfpId: event.id,
          name: dto.name.trim(),
          status: ReviewPeriodStatus.DRAFT,
          opensAt,
          closesAt,
          rubricVersion: 0,
          rubricSnapshot: [],
          createdBy: actorUserId,
          allowSubmittedReviewRevisions: false,
          createdAt: now,
          updatedAt: now,
          openedAt: null,
          closedAt: null,
        };

        transaction.create(
          this.reviewPeriodRepository.getDocumentReference(reviewPeriod.id),
          reviewPeriod,
        );

        return reviewPeriod;
      },
    );
  }

  async updatePeriod(
    organization: Organization,
    event: Event,
    reviewPeriodId: string,
    dto: UpdateReviewPeriodDto,
  ): Promise<ReviewPeriod> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);
        const periodRef =
          this.reviewPeriodRepository.getDocumentReference(reviewPeriodId);

        const [eventSnapshot, periodSnapshot] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(periodRef),
        ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        this.eventsDomainService.assertEditable(eventSnapshot.data()!);

        if (!periodSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review period not found',
          );
        }

        const currentPeriod = periodSnapshot.data()!;

        if (
          currentPeriod.eventId !== event.id ||
          currentPeriod.cfpId !== event.id
        ) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review period not found',
          );
        }

        this.reviewPeriodDomainService.assertDraft(currentPeriod);

        const opensAt =
          dto.opensAt === undefined
            ? currentPeriod.opensAt
            : dto.opensAt
              ? Timestamp.fromDate(new Date(dto.opensAt))
              : null;

        const closesAt =
          dto.closesAt === undefined
            ? currentPeriod.closesAt
            : dto.closesAt
              ? Timestamp.fromDate(new Date(dto.closesAt))
              : null;

        this.reviewPeriodDomainService.assertValidSchedule(opensAt, closesAt);

        const updatedPeriod: ReviewPeriod = {
          ...currentPeriod,
          name: dto.name ? dto.name.trim() : currentPeriod.name,
          opensAt,
          closesAt,
          updatedAt: Timestamp.now(),
        };

        transaction.set(periodRef, updatedPeriod);

        return updatedPeriod;
      },
    );
  }

  async openPeriod(
    organization: Organization,
    event: Event,
    reviewPeriodId: string,
  ): Promise<ReviewPeriod> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);
        const cfpRef = this.cfpRepository.getDocumentReference(event.id);
        const periodRef =
          this.reviewPeriodRepository.getDocumentReference(reviewPeriodId);
        const rubricRef = this.reviewRubricRepository.getDocumentReference(
          event.id,
        );
        const openPeriodQuery = this.reviewPeriodRepository.getOpenByCfpQuery(
          event.id,
        );

        const [
          eventSnapshot,
          cfpSnapshot,
          periodSnapshot,
          rubricSnapshot,
          openPeriodSnapshot,
        ] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(cfpRef),
          transaction.get(periodRef),
          transaction.get(rubricRef),
          transaction.get(openPeriodQuery),
        ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        this.eventsDomainService.assertEditable(eventSnapshot.data()!);

        if (!cfpSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.CFP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'No CFP found for this event',
          );
        }

        const cfp = cfpSnapshot.data()!;

        if (cfp.status !== CfpStatus.CLOSED) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_INVALID_STATE_TRANSITION,
            HttpStatus.CONFLICT,
            'Close the CFP before opening a review period',
          );
        }

        if (!periodSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review period not found',
          );
        }

        const period = periodSnapshot.data()!;

        if (period.eventId !== event.id || period.cfpId !== event.id) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review period not found',
          );
        }

        if (!rubricSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_RUBRIC_NOT_FOUND,
            HttpStatus.CONFLICT,
            'A review rubric is required before opening review',
          );
        }

        if (!openPeriodSnapshot.empty) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_ALREADY_OPEN,
            HttpStatus.CONFLICT,
            'Another review period is already open for this CFP',
          );
        }

        this.reviewPeriodDomainService.open(
          period,
          rubricSnapshot.data()!,
          Timestamp.now(),
        );

        transaction.set(periodRef, period);

        return period;
      },
    );
  }

  async closePeriod(
    organization: Organization,
    event: Event,
    reviewPeriodId: string,
  ): Promise<ReviewPeriod> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);
        const periodRef =
          this.reviewPeriodRepository.getDocumentReference(reviewPeriodId);

        const [eventSnapshot, periodSnapshot] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(periodRef),
        ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        this.eventsDomainService.assertEditable(eventSnapshot.data()!);

        if (!periodSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review period not found',
          );
        }

        const period = periodSnapshot.data()!;

        if (period.eventId !== event.id || period.cfpId !== event.id) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review period not found',
          );
        }

        this.reviewPeriodDomainService.close(period, Timestamp.now());

        transaction.set(periodRef, period);

        return period;
      },
    );
  }

  private buildCriteria(
    dto: UpsertReviewRubricDto,
    existingRubric: ReviewRubric | null,
  ): ReviewCriterion[] {
    const existingCriteria = new Map(
      existingRubric?.criteria.map((criterion) => [criterion.id, criterion]) ??
        [],
    );

    return dto.criteria.map((criterion) => ({
      id:
        criterion.id && existingCriteria.has(criterion.id)
          ? criterion.id
          : randomUUID(),
      label: criterion.label.trim(),
      description: criterion.description?.trim() || null,
      weight: criterion.weight,
      minimumScore: criterion.minimumScore,
      maximumScore: criterion.maximumScore,
      displayOrder: criterion.displayOrder,
      required: criterion.required,
    }));
  }
}
