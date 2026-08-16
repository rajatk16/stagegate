import { Timestamp } from 'firebase-admin/firestore';
import { Injectable, HttpStatus } from '@nestjs/common';

import { AuthenticatedUser } from '@/auth';
import { FirebaseService } from '@/firebase';
import { ErrorCode, ApplicationException } from '@/common';

import { createMembershipFactory } from '../factories';
import { createOrganizationMembershipId } from '../utils';
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
      if (invitation.expiresAt.toMillis() <= Date.now()) {
        invitation.status = OrganizationMembershipInvitationStatus.EXPIRED;
        invitation.updatedAt = Timestamp.now();

        await this.organizationMembershipInvitationRepository.save(invitation);

        return;
      }

      if (
        invitation.status === OrganizationMembershipInvitationStatus.PENDING
      ) {
        throw new ApplicationException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
          'A pending invitation already exists for this email.',
        );
      }
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

  async acceptInvitation(
    user: AuthenticatedUser,
    invitationId: string,
  ): Promise<void> {
    const firestore = this.firebaseService.getFirestore();

    const result = await firestore.runTransaction(async (transaction) => {
      const invitationRef =
        this.organizationMembershipInvitationRepository.getDocumentReference(
          invitationId,
        );

      const invitationSnapshot = await transaction.get(invitationRef);

      if (!invitationSnapshot.exists) {
        throw new ApplicationException(
          ErrorCode.RESOURCE_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          'Invitation not found',
        );
      }

      const invitation = invitationSnapshot.data()!;
      const normalizedEmail = user.email.trim().toLowerCase();

      if (invitation.email !== normalizedEmail) {
        throw new ApplicationException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
          'Invitation email does not match the user email',
        );
      }

      if (
        invitation.status !== OrganizationMembershipInvitationStatus.PENDING
      ) {
        throw new ApplicationException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
          'Invitation is no longer pending',
        );
      }

      if (invitation.expiresAt.toMillis() <= Date.now()) {
        transaction.update(invitationRef, {
          status: OrganizationMembershipInvitationStatus.EXPIRED,
          updatedAt: Timestamp.now(),
        });

        return {
          accepted: false,
          reason: 'EXPIRED',
        };
      }

      const membership = createOrganizationMembershipId(
        invitation.organizationId,
        user.userId,
      );

      const membershipRef =
        this.organizationMembershipRepository.getDocumentReference(membership);

      const membershipSnapshot = await transaction.get(membershipRef);
      const now = Timestamp.now();

      if (!membershipSnapshot.exists) {
        const membership = createMembershipFactory(
          invitation.organizationId,
          user.userId,
          invitation.roles,
          MembershipStatus.ACTIVE,
        );

        transaction.create(membershipRef, membership);
      } else {
        const membership = membershipSnapshot.data()!;

        if (membership.status !== MembershipStatus.ACTIVE) {
          transaction.update(membershipRef, {
            status: MembershipStatus.ACTIVE,
            roles: [...new Set(invitation.roles)],
            joinedAt: now,
            removedAt: null,
            removedBy: null,
            updatedAt: now,
          });
        }
      }

      transaction.update(invitationRef, {
        status: OrganizationMembershipInvitationStatus.ACCEPTED,
        acceptedAt: now,
        acceptedBy: user.userId,
        userId: user.userId,
        updatedAt: now,
      });
    });

    if (result?.reason === 'EXPIRED') {
      throw new ApplicationException(
        ErrorCode.INVITATION_EXPIRED,
        HttpStatus.BAD_REQUEST,
        'Invitation has expired',
      );
    }
  }

  async declineInvitation(user: AuthenticatedUser, id: string) {
    const invitation =
      await this.organizationMembershipInvitationRepository.findById(id);

    if (!invitation) {
      throw new ApplicationException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Invitation not found',
      );
    }

    if (invitation.email !== user.email) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'Invitation email does not match the user email',
      );
    }

    if (invitation.status !== OrganizationMembershipInvitationStatus.PENDING) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'Invitation is no longer pending',
      );
    }

    invitation.status = OrganizationMembershipInvitationStatus.DECLINED;
    invitation.updatedAt = Timestamp.now();

    await this.organizationMembershipInvitationRepository.save(invitation);
  }
}
