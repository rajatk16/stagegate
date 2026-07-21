import { Timestamp } from 'firebase-admin/firestore';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { AuthenticatedUser } from '@/auth/interfaces';
import { FirebaseService } from '@/firebase/firebase.service';

import { createMembershipFactory } from '../factories';
import { OrganizationMembershipInvitation } from '../entities';
import {
  MembershipStatus,
  OrganizationMembershipInvitationStatus,
} from '../enums';
import {
  OrganizationMembershipRepository,
  OrganizationMembershipInvitationRepository,
} from '../repositories';

@Injectable()
export class OrganizationMembershipInvitationService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
    private readonly organizationMembershipInvitationRepository: OrganizationMembershipInvitationRepository,
  ) {}

  async ensureNoPendingInvitation(organizationId: string, email: string) {
    const invitation =
      await this.organizationMembershipInvitationRepository.findPendingByEmail(
        email,
        organizationId,
      );

    if (invitation) {
      throw new BadRequestException(
        'A pending invitation already exists for this email.',
      );
    }
  }

  async save(invitation: OrganizationMembershipInvitation) {
    await this.organizationMembershipInvitationRepository.save(invitation);
  }

  async findById(id: string) {
    return this.organizationMembershipInvitationRepository.findById(id);
  }

  async getInvitations(
    organizationId: string,
    status?: OrganizationMembershipInvitationStatus,
  ) {
    return this.organizationMembershipInvitationRepository.findByOrganization(
      organizationId,
      status,
    );
  }

  async acceptInvitation(user: AuthenticatedUser, id: string) {
    const invitation =
      await this.organizationMembershipInvitationRepository.findById(id);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.email !== user.email) {
      throw new BadRequestException(
        'Invitation email does not match the user email',
      );
    }

    if (invitation.status !== OrganizationMembershipInvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is no longer pending');
    }

    if (invitation.expiresAt.toDate().getTime() < Date.now()) {
      throw new BadRequestException('Invitation has expired');
    }

    const membership = createMembershipFactory(
      invitation.organizationId,
      user.userId,
      invitation.roles,
      MembershipStatus.ACTIVE,
    );

    invitation.status = OrganizationMembershipInvitationStatus.ACCEPTED;
    invitation.acceptedAt = Timestamp.now();
    invitation.acceptedBy = user.userId;
    invitation.updatedAt = Timestamp.now();

    const firestore = this.firebaseService.getFirestore();

    await firestore.runTransaction(async (transaction) => {
      transaction.set(
        this.organizationMembershipRepository.getDocumentReference(
          membership.id,
        ),
        membership,
      );

      transaction.update(
        this.organizationMembershipInvitationRepository.getDocumentReference(
          invitation.id,
        ),
        {
          status: invitation.status,
          acceptedAt: invitation.acceptedAt,
          acceptedBy: invitation.acceptedBy,
          updatedAt: invitation.updatedAt,
        },
      );

      await Promise.resolve();
    });
  }

  async declineInvitation(user: AuthenticatedUser, id: string) {
    const invitation =
      await this.organizationMembershipInvitationRepository.findById(id);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.email !== user.email) {
      throw new BadRequestException(
        'Invitation email does not match the user email',
      );
    }

    if (invitation.status !== OrganizationMembershipInvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is no longer pending');
    }

    invitation.status = OrganizationMembershipInvitationStatus.DECLINED;
    invitation.updatedAt = Timestamp.now();

    await this.organizationMembershipInvitationRepository.save(invitation);
  }
}
