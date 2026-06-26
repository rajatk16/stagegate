import { Timestamp } from 'firebase-admin/firestore';
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { normalizeSlug } from '@/common/utils';
import { UsersService } from '@/users/services';
import { AuthenticatedUser } from '@/auth/interfaces';
import { OrganizationRole } from '@/authorization/enums';
import { FirebaseService } from '@/firebase/firebase.service';

import { OrganizationStatus } from '../enums';
import { OrganizationService } from './organization.service';
import { Organization, OrganizationMembership } from '../entities';
import { OrganizationDomainService } from './organizationDomain.service';
import { OrganizationMembershipService } from './organizationMembership.service';
import { OrganizationMembershipInvitationService } from './organizationMembershipInvitation.service';
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
    private readonly organizationMembershipInvitationService: OrganizationMembershipInvitationService,
  ) {}

  async getOrganizationsForUser(userId: string) {
    const memberships =
      await this.organizationMembershipService.findUserMemberships(userId);

    if (!memberships || memberships.length === 0) {
      return [];
    } else {
      const organizationIds = memberships.map(
        (membership) => membership.organizationId,
      );

      const organizations =
        await this.organizationService.findByIds(organizationIds);

      return organizations.map(OrganizationMapper.toSummaryDto);
    }
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
          throw new ConflictException('Organization Slug already in use');
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
      throw new NotFoundException('User not found');
    }
    return OrganizationMemberMapper.toDto(user, membership);
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
      const isMember = await this.organizationMembershipService.isActiveMember(
        organization.id,
        existingUser.id,
      );

      if (isMember) {
        throw new BadRequestException(
          'User is already a member of the organization',
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
    if (organization.status === OrganizationStatus.ARCHIVED) {
      throw new BadRequestException(
        'Archived organizations cannot be modified.',
      );
    }

    if (dto.roles.includes(OrganizationRole.OWNER)) {
      throw new BadRequestException(
        'The OWNER role cannot be modified through this endpoint. Use the transfer ownership endpoint.',
      );
    }

    const targetMembership =
      await this.organizationMembershipService.findActiveMembership(
        targetUserId,
        organization.id,
      );

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    if (targetMembership.organizationId !== organization.id) {
      throw new NotFoundException('Member not found');
    }

    if (currentMembership.id === targetMembership.id) {
      throw new BadRequestException('You cannot modify your own roles');
    }

    await this.organizationMembershipService.updateRoles(
      targetMembership,
      dto.roles,
    );

    const user = await this.usersService.findById(targetMembership.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return OrganizationMemberMapper.toDto(user, targetMembership);
  }

  async removeMember(
    organization: Organization,
    actingMembership: OrganizationMembership,
    targetUserId: string,
  ): Promise<OrganizationMemberDto> {
    if (organization.status === OrganizationStatus.ARCHIVED) {
      throw new BadRequestException(
        'Archived organizations cannot be modified.',
      );
    }

    const targetMembership =
      await this.organizationMembershipService.findActiveMembership(
        targetUserId,
        organization.id,
      );

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    if (targetMembership.organizationId !== organization.id) {
      throw new NotFoundException('Member not found');
    }

    if (actingMembership.userId === targetMembership.userId) {
      throw new BadRequestException(
        'You cannot remove yourself. Use the leave organization endpoint instead.',
      );
    }

    const targetIsOwner = targetMembership.roles.includes(
      OrganizationRole.OWNER,
    );

    if (targetIsOwner) {
      throw new ForbiddenException(
        'Cannot remove owners from the organization',
      );
    }

    await this.organizationMembershipService.remove(
      targetMembership,
      actingMembership.userId,
    );

    const user = await this.usersService.findById(targetMembership.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return OrganizationMemberMapper.toDto(user, targetMembership);
  }

  async leaveOrganization(
    organization: Organization,
    currentMembership: OrganizationMembership,
  ): Promise<void> {
    if (organization.status === OrganizationStatus.ARCHIVED) {
      throw new BadRequestException(
        'Archived organizations cannot be modified.',
      );
    }

    if (currentMembership.roles.includes(OrganizationRole.OWNER)) {
      throw new ForbiddenException(
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
    if (!currentMembership.roles.includes(OrganizationRole.OWNER)) {
      throw new ForbiddenException(
        'Only the organization owner can transfer ownership.',
      );
    }

    const targetMembership =
      await this.organizationMembershipService.findActiveMembership(
        targetUserId,
        organization.id,
      );

    if (!targetMembership) {
      throw new NotFoundException('Member not found.');
    }

    if (targetMembership.userId === currentMembership.userId) {
      throw new BadRequestException('You already own this organization.');
    }

    if (targetMembership.roles.includes(OrganizationRole.OWNER)) {
      throw new BadRequestException('Target member is already the owner.');
    }

    await this.organizationMembershipService.transferOwnership(
      currentMembership,
      targetMembership,
    );

    const user = await this.usersService.findById(targetMembership.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return OrganizationMemberMapper.toDto(user, targetMembership);
  }
}
