import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { Event } from '@/events';
import { Cfp, CfpRepository } from '@/cfps';
import { FirebaseService } from '@/firebase';
import { Organization } from '@/organizations';
import { PublicVisibilityPolicyService } from '@/public';
import { ApplicationException, ErrorCode } from '@/common';

import { Proposal } from '../entities';
import { ProposalStatus } from '../enums';
import { ProposalMapper } from '../mappers';
import { createProposalFactory } from '../factories';
import { ProposalDomainService } from './proposalDomain.service';
import { ProposalRepository, SpeakerProfileRepository } from '../repositories';
import { SpeakerContextResolverService } from './speakerContextResolver.service';
import {
  SubmitProposalDto,
  ProposalDetailsDto,
  ProposalSummaryDto,
  CreateProposalDraftDto,
  UpdateProposalDraftDto,
} from '../dtos';

@Injectable()
export class ProposalApplicationService {
  constructor(
    private readonly cfpRepository: CfpRepository,
    private readonly firebaseService: FirebaseService,
    private readonly proposalRepository: ProposalRepository,
    private readonly proposalDomainService: ProposalDomainService,
    private readonly speakerProfileRepository: SpeakerProfileRepository,
    private readonly publicVisibilityPolicyService: PublicVisibilityPolicyService,
    private readonly speakerContextResolverService: SpeakerContextResolverService,
  ) {}

  async createDraft(
    eventPublicId: string,
    userId: string,
    dto: CreateProposalDraftDto,
  ): Promise<ProposalDetailsDto> {
    const { event, cfp } =
      await this.speakerContextResolverService.resolveOpenCfp(eventPublicId);

    this.proposalDomainService.assertDraftCreationAllowed(cfp);

    this.proposalDomainService.assertTrackSelection(cfp, dto.trackId, false);

    const proposalId = randomUUID();

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const profileRef = this.speakerProfileRepository.getDocumentReference(
          event.id,
          userId,
        );

        const proposalCountQuery =
          this.proposalRepository.getCountByEventAndOwner(event.id, userId);

        const [profileSnapshot, countSnapshot] = await Promise.all([
          transaction.get(profileRef),
          transaction.get(proposalCountQuery),
        ]);

        if (!profileSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.SPEAKER_PROFILE_NOT_FOUND,
            HttpStatus.CONFLICT,
            'Create a speaker profile before creating a proposal.',
          );
        }

        const currentCount = countSnapshot.data()?.count ?? 0;

        this.proposalDomainService.assertProposalLimit(
          currentCount,
          cfp.maxSubmissionsPerSpeaker,
        );

        const proposal = createProposalFactory(
          event.id,
          userId,
          profileSnapshot.data()!.id,
          dto,
        );

        proposal.id = proposalId;
        transaction.create(
          this.proposalRepository.getDocumentReference(proposalId),
          proposal,
        );

        return ProposalMapper.toDetailsDto(proposal);
      },
    );
  }

  async listMine(
    eventPublicId: string,
    userId: string,
  ): Promise<ProposalSummaryDto[]> {
    const { event } =
      await this.speakerContextResolverService.resolveAccessibleCfp(
        eventPublicId,
      );

    const proposals = await this.proposalRepository.findByEventAndOwner(
      event.id,
      userId,
    );

    return proposals.map((proposal) => ProposalMapper.toSummaryDto(proposal));
  }

  async getMine(
    eventPublicId: string,
    proposalId: string,
    userId: string,
  ): Promise<ProposalDetailsDto> {
    const { event } =
      await this.speakerContextResolverService.resolveAccessibleCfp(
        eventPublicId,
      );

    const proposal = await this.proposalRepository.findById(proposalId);

    if (
      !proposal ||
      proposal.eventId !== event.id ||
      proposal.ownerUserId !== userId
    ) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Proposal not found.',
      );
    }

    return ProposalMapper.toDetailsDto(proposal);
  }

  async updateProposal(
    eventPublicId: string,
    proposalId: string,
    userId: string,
    dto: UpdateProposalDraftDto,
  ): Promise<ProposalDetailsDto> {
    const { event, cfp } =
      await this.speakerContextResolverService.resolveOpenCfp(eventPublicId);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const proposalRef =
          this.proposalRepository.getDocumentReference(proposalId);

        const proposalSnapshot = await transaction.get(proposalRef);

        if (!proposalSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found.',
          );
        }

        const proposal = proposalSnapshot.data()!;

        if (proposal.eventId !== event.id) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found.',
          );
        }

        this.proposalDomainService.assertCanEdit(proposal, userId, cfp);

        const updatedProposal: Proposal = {
          ...proposal,
          title: dto.title === undefined ? proposal.title : dto.title.trim(),
          abstract:
            dto.abstract === undefined
              ? proposal.abstract
              : dto.abstract.trim(),
          description:
            dto.description === undefined
              ? proposal.description
              : (dto.description?.trim() ?? null),
          format: dto.format ?? proposal.format,
          durationMinutes:
            dto.durationMinutes === undefined
              ? proposal.durationMinutes
              : dto.durationMinutes,
          language:
            dto.language === undefined
              ? proposal.language
              : dto.language?.trim().toLowerCase(),
          updatedAt: Timestamp.now(),
          trackId: dto.trackId === undefined ? proposal.trackId : dto.trackId,
        };

        this.proposalDomainService.assertTrackSelection(
          cfp,
          updatedProposal.trackId,
          true,
        );

        transaction.set(proposalRef, updatedProposal);

        return ProposalMapper.toDetailsDto(updatedProposal);
      },
    );
  }

  async submitProposal(
    eventPublicId: string,
    proposalId: string,
    userId: string,
    dto: SubmitProposalDto,
  ): Promise<ProposalDetailsDto> {
    const { event, organization } =
      await this.speakerContextResolverService.resolveOpenCfp(eventPublicId);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const proposalRef =
          this.proposalRepository.getDocumentReference(proposalId);

        const profileRef = this.speakerProfileRepository.getDocumentReference(
          event.id,
          userId,
        );

        const cfpRef = this.cfpRepository.getDocumentReference(event.id);

        const [proposalSnapshot, profileSnapshot, cfpSnapshot] =
          await Promise.all([
            transaction.get(proposalRef),
            transaction.get(profileRef),
            transaction.get(cfpRef),
          ]);

        if (!cfpSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.CFP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'CFP not found',
          );
        }

        if (!proposalSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found.',
          );
        }

        if (!profileSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.SPEAKER_PROFILE_NOT_FOUND,
            HttpStatus.CONFLICT,
            'Speaker profile is required before submitting',
          );
        }

        const proposal = proposalSnapshot.data()!;
        const profile = profileSnapshot.data()!;
        const currentCfp = cfpSnapshot.data()!;

        if (proposal.eventId !== event.id) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found.',
          );
        }

        this.publicVisibilityPolicyService.assertCfpVisible(
          organization,
          event,
          currentCfp,
          Timestamp.now(),
        );

        this.proposalDomainService.assertCanSubmit(
          proposal,
          userId,
          currentCfp,
          dto,
        );

        this.proposalDomainService.assertTrackSelection(
          currentCfp,
          proposal.trackId,
          true,
        );

        this.proposalDomainService.assertCompleteForSubmission(proposal);
        this.proposalDomainService.assertProfileCompleteForSubmission(profile);

        const now = Timestamp.now();

        const submittedProposal: Proposal = {
          ...proposal,
          status: ProposalStatus.SUBMITTED,
          submittedAt: now,
          updatedAt: now,
          consent: currentCfp.requiredConsent
            ? {
                version: currentCfp.requiredConsent.version,
                contentHash: currentCfp.requiredConsent.contentHash,
                acceptedAt: now,
                acceptedByUserId: userId,
              }
            : null,
          primarySpeakerSnapshot: {
            displayName: profile.displayName,
            biography: profile.biography,
            organization: profile.organization,
            jobTitle: profile.jobTitle,
            location: profile.location,
            websiteUrl: profile.websiteUrl,
            pronouns: profile.pronouns,
          },
        };

        transaction.set(proposalRef, submittedProposal);

        return ProposalMapper.toDetailsDto(submittedProposal);
      },
    );
  }

  async withdrawProposal(
    eventPublicId: string,
    proposalId: string,
    userId: string,
  ): Promise<ProposalDetailsDto> {
    const { event, cfp } =
      await this.speakerContextResolverService.resolveAccessibleCfp(
        eventPublicId,
      );

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const proposalRef =
          this.proposalRepository.getDocumentReference(proposalId);

        const proposalSnapshot = await transaction.get(proposalRef);

        if (!proposalSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found.',
          );
        }

        const proposal = proposalSnapshot.data()!;

        if (proposal.eventId !== event.id) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found.',
          );
        }

        this.proposalDomainService.assertCanWithdraw(proposal, userId, cfp);

        const withdrawnProposal: Proposal = {
          ...proposal,
          status: ProposalStatus.WITHDRAWN,
          withdrawnAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        transaction.set(proposalRef, withdrawnProposal);
        return ProposalMapper.toDetailsDto(withdrawnProposal);
      },
    );
  }

  private assertCurrentCfpIsOpen(
    organization: Organization,
    event: Event,
    cfp: Cfp,
  ) {
    this.publicVisibilityPolicyService.assertCfpVisible(
      organization,
      event,
      cfp,
      Timestamp.now(),
    );
  }
}
