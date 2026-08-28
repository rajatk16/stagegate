import { createHash } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';
import { ErrorCode, ApplicationException } from '@/common';
import { Event, EventRepository, EventsDomainService } from '@/events';
import {
  Organization,
  OrganizationLifecyclePolicyService,
} from '@/organizations';

import { Cfp } from '../entities';
import { CfpMapper } from '../mappers';
import { CfpRepository } from '../repositories';
import { CfpDomainService } from './cfpDomain.service';
import { CfpDetailsDto, CreateCfpDto, UpdateCfpDto } from '../dtos';
import { createCfpFactory, normalizeCfpTracks } from '../factories';

@Injectable()
export class CfpApplicationService {
  constructor(
    private readonly cfpRepository: CfpRepository,
    private readonly eventRepository: EventRepository,
    private readonly firebaseService: FirebaseService,
    private readonly cfpDomainService: CfpDomainService,
    private readonly eventsDomainService: EventsDomainService,
    private readonly organizationLifecyclePolicyService: OrganizationLifecyclePolicyService,
  ) {}

  async createCfp(
    organization: Organization,
    event: Event,
    actorUserId: string,
    dto: CreateCfpDto,
  ): Promise<CfpDetailsDto> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    const cfp = createCfpFactory(event, actorUserId, dto);
    this.cfpDomainService.assertValidConfiguration(cfp);

    await this.firebaseService.firestore.runTransaction(async (transaction) => {
      const cfpRef = this.cfpRepository.getDocumentReference(event.id);
      const existingCfp = await transaction.get(cfpRef);

      if (existingCfp.exists) {
        throw new ApplicationException(
          ErrorCode.CFP_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
          'A CFP already exists for this event',
        );
      }

      transaction.create(cfpRef, cfp);
    });

    return CfpMapper.toDetailsDto(cfp);
  }

  async getCfp(event: Event) {
    const cfp = await this.cfpRepository.findByEventId(event.id);

    if (!cfp) {
      throw new ApplicationException(
        ErrorCode.CFP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'No CFP found for this event',
      );
    }

    return CfpMapper.toDetailsDto(cfp);
  }

  async updateCfp(organization: Organization, event: Event, dto: UpdateCfpDto) {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const cfpRef = this.cfpRepository.getDocumentReference(event.id);
        const cfp = await transaction.get(cfpRef);

        if (!cfp.exists) {
          throw new ApplicationException(
            ErrorCode.CFP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'No CFP found for this event',
          );
        }

        const cfpData = cfp.data()!;

        this.cfpDomainService.assertEditable(cfpData);

        const updatedCfp: Cfp = {
          ...cfpData,
          title: dto.title === undefined ? cfpData.title : dto.title,
          description:
            dto.description === undefined
              ? cfpData.description
              : dto.description?.trim() || null,
          timezone: dto.timezone ?? cfpData.timezone,
          maxSubmissionsPerSpeaker:
            dto.maxSubmissionsPerSpeaker ?? cfpData.maxSubmissionsPerSpeaker,
          maxSpeakersPerSubmission:
            dto.maxSpeakersPerSubmission ?? cfpData.maxSpeakersPerSubmission,
          allowDrafts: dto.allowDrafts ?? cfpData.allowDrafts,
          allowEditsWhileOpen:
            dto.allowEditsWhileOpen ?? cfpData.allowEditsWhileOpen,
          allowWithdrawals: dto.allowWithdrawals ?? cfpData.allowWithdrawals,
          opensAt:
            dto.opensAt === undefined
              ? cfpData.opensAt
              : dto.opensAt === null
                ? null
                : Timestamp.fromDate(new Date(dto.opensAt)),
          closesAt:
            dto.closesAt === undefined
              ? cfpData.closesAt
              : dto.closesAt === null
                ? null
                : Timestamp.fromDate(new Date(dto.closesAt)),
          requiredConsent:
            dto.requiredConsent === undefined
              ? cfpData.requiredConsent
              : dto.requiredConsent
                ? {
                    version: dto.requiredConsent.version.trim(),
                    content: dto.requiredConsent.content.trim(),
                    contentHash: createHash('sha256')
                      .update(dto.requiredConsent.content.trim(), 'utf-8')
                      .digest('hex'),
                  }
                : null,
          updatedAt: Timestamp.now(),
          tracks:
            dto.tracks === undefined
              ? cfpData.tracks
              : normalizeCfpTracks(dto.tracks),
        };

        this.cfpDomainService.assertValidConfiguration(updatedCfp);

        transaction.update(cfpRef, {
          ...updatedCfp,
        });

        return CfpMapper.toDetailsDto(updatedCfp);
      },
    );
  }

  async openCfp(organization: Organization, event: Event) {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);
        const cfpRef = this.cfpRepository.getDocumentReference(event.id);

        const [eventSnapshot, cfpSnapshot] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(cfpRef),
        ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        if (!cfpSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.CFP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'No CFP found for this event',
          );
        }

        const currentEvent = eventSnapshot.data()!;
        const cfp = cfpSnapshot.data()!;

        this.eventsDomainService.assertEditable(currentEvent);
        this.cfpDomainService.open(cfp, currentEvent, Timestamp.now());

        transaction.update(cfpRef, {
          ...cfp,
        });

        return CfpMapper.toDetailsDto(cfp);
      },
    );
  }

  async closeCfp(organization: Organization, event: Event) {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);
        const cfpRef = this.cfpRepository.getDocumentReference(event.id);

        const [eventSnapshot, cfpSnapshot] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(cfpRef),
        ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        if (!cfpSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.CFP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'No CFP found for this event',
          );
        }

        const currentEvent = eventSnapshot.data()!;
        const cfp = cfpSnapshot.data()!;

        this.eventsDomainService.assertEditable(currentEvent);
        this.cfpDomainService.close(cfp, Timestamp.now());

        transaction.update(cfpRef, {
          ...cfp,
        });

        return CfpMapper.toDetailsDto(cfp);
      },
    );
  }
}
