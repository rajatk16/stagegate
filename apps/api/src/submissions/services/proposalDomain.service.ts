import { HttpStatus, Injectable } from '@nestjs/common';

import { Cfp } from '@/cfps';
import { ApplicationException, ErrorCode } from '@/common';

import { Proposal, SpeakerProfile } from '../entities';
import { ProposalStatus } from '../enums';
import { SubmitProposalDto } from '../dtos';

@Injectable()
export class ProposalDomainService {
  assertDraftCreationAllowed(cfp: Cfp) {
    if (!cfp.allowDrafts) {
      throw new ApplicationException(
        ErrorCode.DRAFT_DISABLED,
        HttpStatus.FORBIDDEN,
        'Draft creation is not allowed for this CFP',
      );
    }
  }

  assertEditableByOwner(proposal: Proposal, ownerUserId: string, cfp: Cfp) {
    if (proposal.ownerUserId !== ownerUserId) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Proposal not found',
      );
    }

    if (proposal.status !== ProposalStatus.DRAFT) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'Only draft proposals can be edited',
      );
    }

    this.assertDraftCreationAllowed(cfp);
  }

  assertProposalLimit(
    currentProposalCount: number,
    maxSubmissionsPerSpeaker: number,
  ) {
    if (currentProposalCount >= maxSubmissionsPerSpeaker) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_LIMIT_REACHED,
        HttpStatus.CONFLICT,
        'The maximum number of proposals for this CFP has been reached',
      );
    }
  }

  assertCanSubmit(
    proposal: Proposal,
    userId: string,
    cfp: Cfp,
    dto: SubmitProposalDto,
  ) {
    this.assertOwnedBy(proposal, userId);

    if (proposal.status === ProposalStatus.SUBMITTED) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_ALREADY_SUBMITTED,
        HttpStatus.CONFLICT,
        'Proposal has already been submitted',
      );
    }

    if (proposal.status === ProposalStatus.WITHDRAWN) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_WITHDRAWN,
        HttpStatus.CONFLICT,
        'A withdrawn proposal cannot be submitted',
      );
    }

    if (proposal.status !== ProposalStatus.DRAFT) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_NOT_SUBMITTABLE,
        HttpStatus.CONFLICT,
        'Proposal cannot be submitted',
      );
    }

    if (
      cfp.requiredConsent &&
      (!dto.consentAccepted ||
        dto.consentVersion !== cfp.requiredConsent.version)
    ) {
      throw new ApplicationException(
        dto.consentAccepted
          ? ErrorCode.CONSENT_VERSION_MISMATCH
          : ErrorCode.CONSENT_REQUIRED,
        HttpStatus.CONFLICT,
        'Required consent must be accepted before submitting',
      );
    }
  }
  assertCanEdit(proposal: Proposal, userId: string, cfp: Cfp) {
    this.assertOwnedBy(proposal, userId);

    if (proposal.status === ProposalStatus.DRAFT) {
      this.assertDraftCreationAllowed(cfp);
      return;
    }

    if (
      proposal.status === ProposalStatus.SUBMITTED &&
      cfp.allowEditsWhileOpen
    ) {
      return;
    }

    throw new ApplicationException(
      ErrorCode.PROPOSAL_NOT_EDITABLE,
      HttpStatus.CONFLICT,
      'This proposal cannot be edited',
    );
  }

  assertCanWithdraw(proposal: Proposal, userId: string, cfp: Cfp) {
    this.assertOwnedBy(proposal, userId);

    if (proposal.status !== ProposalStatus.SUBMITTED) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_WITHDRAWAL_NOT_ALLOWED,
        HttpStatus.CONFLICT,
        'Only submitted proposal can be withdrawn',
      );
    }

    if (!cfp.allowWithdrawals) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_WITHDRAWAL_NOT_ALLOWED,
        HttpStatus.CONFLICT,
        'Proposal withdrawal is not enabled for this CFP',
      );
    }
  }

  private assertOwnedBy(proposal: Proposal, userId: string) {
    if (proposal.ownerUserId !== userId) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Proposal not found',
      );
    }
  }

  assertCompleteForSubmission(proposal: Proposal): void {
    if (!proposal.title.trim()) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_NOT_SUBMITTABLE,
        HttpStatus.BAD_REQUEST,
        'Proposal title is required',
      );
    }

    if (!proposal.abstract.trim()) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_NOT_SUBMITTABLE,
        HttpStatus.BAD_REQUEST,
        'Proposal abstract is required',
      );
    }

    if (!proposal.language.trim()) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_NOT_SUBMITTABLE,
        HttpStatus.BAD_REQUEST,
        'Proposal language is required',
      );
    }
  }

  assertProfileCompleteForSubmission(profile: SpeakerProfile) {
    if (!profile.displayName.trim()) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_NOT_SUBMITTABLE,
        HttpStatus.BAD_REQUEST,
        'Speaker display name is required',
      );
    }
  }
}
