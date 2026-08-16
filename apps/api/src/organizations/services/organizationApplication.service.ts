import { Timestamp } from 'firebase-admin/firestore';
import { Injectable, HttpStatus } from '@nestjs/common';

import { UsersService } from '@/users';
import { FirebaseService } from '@/firebase';
import { AuthenticatedUser, OrganizationRole } from '@/auth';
import { ErrorCode, ApplicationException, normalizeSlug } from '@/common';

import { OrganizationService } from './organization.service';
import { Organization, OrganizationMembership } from '../entities';
import { OrganizationDomainService } from './organizationDomain.service';
import { OrganizationMembershipService } from './organizationMembership.service';
import { OrganizationAuthorizationPolicyService } from './organizationAuthorizationPolicy.service';
import { OrganizationMembershipInvitationService } from './organizationMembershipInvitation.service';
import {
  MembershipStatus,
  OrganizationMembershipInvitationStatus,
} from '../enums';
import {
  createOrganizationSlugFactory,
  createMembershipInvitationFactory,
} from '../factories';
import {
  OrganizationRepository,
  OrganizationSlugRepository,
} from '../repositories';
import {
  OrganizationMapper,
  OrganizationMemberMapper,
  OrganizationMembershipInvitationMapper,
} from '../mappers';
import {
  OrganizationMemberDto,
  UpdateOrganizationDto,
  OrganizationDetailsDto,
  UpdateOrganizationMemberDto,
  CreateMembershipInvitationDto,
  OrganizationMembershipInvitationDto,
} from '../dtos';

@Injectable()
export class OrganizationApplicationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService,
    private readonly organizationService: OrganizationService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationDomainService: OrganizationDomainService,
    private readonly organizationSlugRepository: OrganizationSlugRepository,
    private readonly organizationMembershipService: OrganizationMembershipService,
    private readonly organizationAuthorizationPolicyService: OrganizationAuthorizationPolicyService,
    private readonly organizationMembershipInvitationService: OrganizationMembershipInvitationService,
  ) {}

  async getOrganizationsForUser(userId: string) {
    const memberships =
      await this.organizationMembershipService.findActiveUserMemberships(
        userId,
      );

    if (memberships.length === 0) {
      return [];
    }

    const organizationIds = memberships.map(
      (membership) => membership.organizationId,
    );

    const organizations =
      await this.organizationService.findByIds(organizationIds);

    return organizations.map(OrganizationMapper.toSummaryDto);
  }

  getOrganization(organization: Organization) {
    return OrganizationMapper.toDetailsDto(organization);
  }

  async updateOrganization(
    organization: Organization,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationDetailsDto> {
    const updatedSlug = dto.slug ? normalizeSlug(dto.slug) : organization.slug;

    const slugChanged = updatedSlug !== organization.slug;

    const updatedOrganization = {
      ...organization,
      name: dto.name ?? organization.name,
      slug: updatedSlug,
      description: Object.prototype.hasOwnProperty.call(dto, 'description')
        ? dto.description
        : organization.description,
      websiteUrl: Object.prototype.hasOwnProperty.call(dto, 'websiteUrl')
        ? dto.websiteUrl
        : organization.websiteUrl,
      logoUrl: Object.prototype.hasOwnProperty.call(dto, 'logoUrl')
        ? dto.logoUrl
        : organization.logoUrl,
      updatedAt: Timestamp.now(),
    };

    const firestore = this.firebaseService.getFirestore();

    await firestore.runTransaction(async (transaction) => {
      const organizationRef = this.organizationRepository.getDocumentReference(
        organization.id,
      );

      if (slugChanged) {
        const newSlugRef =
          this.organizationSlugRepository.getDocumentReference(updatedSlug);

        const existingSlug = await transaction.get(newSlugRef);

        if (existingSlug.exists) {
          throw new ApplicationException(
            ErrorCode.CONFLICT,
            HttpStatus.CONFLICT,
            'Organization Slug already in use',
          );
        }

        const oldSlugRef = this.organizationSlugRepository.getDocumentReference(
          organization.slug,
        );

        transaction.delete(oldSlugRef);

        transaction.set(
          newSlugRef,
          createOrganizationSlugFactory(updatedSlug, organization.id),
        );
      }

      transaction.update(organizationRef, updatedOrganization);
    });

    return OrganizationMapper.toDetailsDto(updatedOrganization);
  }

  async archiveOrganization(organization: Organization): Promise<void> {
    this.organizationDomainService.archive(organization);

    await this.organizationRepository.save(organization);
  }

  async restoreOrganization(organization: Organization): Promise<void> {
    this.organizationDomainService.restore(organization);

    await this.organizationRepository.save(organization);
  }

  async getMembers(
    organization: Organization,
  ): Promise<OrganizationMemberDto[]> {
    const memberships =
      await this.organizationMembershipService.findActiveMembers(
        organization.id,
      );

    const users = await this.usersService.findByIds(
      memberships.map((membership) => membership.userId),
    );

    const usersById = new Map(users.map((user) => [user.id, user]));

    return memberships.flatMap((membership) => {
      const user = usersById.get(membership.userId);

      if (!user) {
        return [];
      }

      return [OrganizationMemberMapper.toDto(user, membership)];
    });
  }

  async getCurrentMember(
    membership: OrganizationMembership,
  ): Promise<OrganizationMemberDto> {
    const user = await this.usersService.findById(membership.userId);

    if (!user) {
      throw new ApplicationException(
        ErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'User not found',
      );
    }
    return OrganizationMemberMapper.toDto(user, membership);
  }

  async getInvitations(
    organization: Organization,
    status?: OrganizationMembershipInvitationStatus,
  ): Promise<OrganizationMembershipInvitationDto[]> {
    const invitations =
      await this.organizationMembershipInvitationService.getInvitations(
        organization.id,
        status,
      );

    return invitations.map((invitation) =>
      OrganizationMembershipInvitationMapper.toDto(invitation),
    );
  }

  async revokeInvitation(
    organization: Organization,
    invitationId: string,
  ): Promise<void> {
    const invitation =
      await this.organizationMembershipInvitationService.findById(invitationId);

    if (!invitation) {
      throw new ApplicationException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Invitation not found',
      );
    }

    if (invitation.organizationId !== organization.id) {
      throw new ApplicationException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Invitation not found',
      );
    }

    if (
      invitation.status !== OrganizationMembershipInvitationStatus.PENDING &&
      invitation.status !== OrganizationMembershipInvitationStatus.EXPIRED
    ) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'Only pending or expired invitations can be revoked.',
      );
    }

    invitation.status = OrganizationMembershipInvitationStatus.REVOKED;

    invitation.updatedAt = Timestamp.now();

    await this.organizationMembershipInvitationService.save(invitation);
  }

  async inviteMember(
    organization: Organization,
    invitedBy: string,
    dto: CreateMembershipInvitationDto,
  ): Promise<OrganizationMembershipInvitationDto> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    await this.organizationMembershipInvitationService.ensureNoPendingInvitation(
      organization.id,
      normalizedEmail,
    );

    const existingUser = await this.usersService.findByEmail(normalizedEmail);

    if (existingUser) {
      const membership =
        await this.organizationMembershipService.findMembership(
          existingUser.id,
          organization.id,
        );

      if (membership?.status === MembershipStatus.ACTIVE) {
        throw new ApplicationException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
          'User is already an active member of the organization',
        );
      }
    }

    const invitation = createMembershipInvitationFactory(
      organization.id,
      normalizedEmail,
      invitedBy,
      dto.roles,
    );

    await this.organizationMembershipInvitationService.save(invitation);

    return OrganizationMembershipInvitationMapper.toDto(invitation);
  }

  async acceptInvitation(
    user: AuthenticatedUser,
    invitationId: string,
  ): Promise<void> {
    await this.organizationMembershipInvitationService.acceptInvitation(
      user,
      invitationId,
    );
  }

  async declineInvitation(
    user: AuthenticatedUser,
    invitationId: string,
  ): Promise<void> {
    await this.organizationMembershipInvitationService.declineInvitation(
      user,
      invitationId,
    );
  }

  async updateMemberRoles(
    organization: Organization,
    currentMembership: OrganizationMembership,
    targetUserId: string,
    dto: UpdateOrganizationMemberDto,
  ): Promise<OrganizationMemberDto> {
    if (dto.roles.includes(OrganizationRole.OWNER)) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'The OWNER role cannot be modified through this endpoint. Use the transfer ownership endpoint.',
      );
    }

    const targetMembership =
      await this.organizationMembershipService.findActiveMembership(
        targetUserId,
        organization.id,
      );

    if (!targetMembership) {
      throw new ApplicationException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Member not found',
      );
    }

    if (targetMembership.organizationId !== organization.id) {
      throw new ApplicationException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Member not found',
      );
    }

    this.organizationAuthorizationPolicyService.assertCanManageMember(
      currentMembership,
      targetMembership,
    );

    await this.organizationMembershipService.updateRoles(
      targetMembership,
      dto.roles,
    );

    const user = await this.usersService.findById(targetMembership.userId);

    if (!user) {
      throw new ApplicationException(
        ErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'User not found',
      );
    }

    return OrganizationMemberMapper.toDto(user, targetMembership);
  }

  async removeMember(
    organization: Organization,
    actingMembership: OrganizationMembership,
    targetUserId: string,
  ): Promise<OrganizationMemberDto> {
    const targetMembership =
      await this.organizationMembershipService.findActiveMembership(
        targetUserId,
        organization.id,
      );

    if (!targetMembership) {
      throw new ApplicationException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Member not found',
      );
    }

    if (targetMembership.organizationId !== organization.id) {
      throw new ApplicationException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Member not found',
      );
    }

    this.organizationAuthorizationPolicyService.assertCanManageMember(
      actingMembership,
      targetMembership,
    );

    await this.organizationMembershipService.remove(
      targetMembership,
      actingMembership.userId,
    );

    const user = await this.usersService.findById(targetMembership.userId);

    if (!user) {
      throw new ApplicationException(
        ErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'User not found',
      );
    }

    return OrganizationMemberMapper.toDto(user, targetMembership);
  }

  async leaveOrganization(
    currentMembership: OrganizationMembership,
  ): Promise<void> {
    if (currentMembership.roles.includes(OrganizationRole.OWNER)) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'Cannot leave the organization as an owner. Use transfer ownership endpoint instead.',
      );
    }

    await this.organizationMembershipService.remove(
      currentMembership,
      currentMembership.userId,
    );
  }

  async transferOwnership(
    organization: Organization,
    currentMembership: OrganizationMembership,
    targetUserId: string,
  ): Promise<OrganizationMemberDto> {
    const targetMembership =
      await this.organizationMembershipService.findActiveMembership(
        targetUserId,
        organization.id,
      );

    if (!targetMembership) {
      throw new ApplicationException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Member not found.',
      );
    }

    this.organizationAuthorizationPolicyService.assertCanTransferOwnership(
      currentMembership,
      targetMembership,
    );

    await this.organizationMembershipService.transferOwnership(
      currentMembership,
      targetMembership,
    );

    const user = await this.usersService.findById(targetMembership.userId);

    if (!user) {
      throw new ApplicationException(
        ErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'User not found',
      );
    }

    return OrganizationMemberMapper.toDto(user, targetMembership);
  }
}
