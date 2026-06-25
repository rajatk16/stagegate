import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { FirebaseService } from '@/firebase/firebase.service';

import { OrganizationMapper } from '../mappers';
import { OrganizationDetailsDto } from '../dtos';
import {
  OrganizationService,
  OrganizationMembershipService,
} from '../services';
import {
  OrganizationRepository,
  OrganizationSlugRepository,
} from '../repositories';
import { UpdateOrganizationDto } from '../dtos/updateOrganizaiton.dto';
import { normalizeSlug } from '@/common/utils';
import { Timestamp } from 'firebase-admin/firestore';
import { createOrganizationSlugFactory } from '../factories';

@Injectable()
export class OrganizationApplicationService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationMembershipService: OrganizationMembershipService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationSlugRepository: OrganizationSlugRepository,
    private readonly firebaseService: FirebaseService,
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

  async getOrganization(organizationSlug: string, userId: string) {
    const organization =
      await this.organizationService.findBySlug(organizationSlug);

    const membership = await this.organizationMembershipService.findMembership(
      userId,
      organization.id,
    );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return OrganizationMapper.toDetailsDto(organization);
  }

  async updateOrganization(
    organizationId: string,
    userId: string,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationDetailsDto> {
    const organization =
      await this.organizationService.findBySlug(organizationId);

    const membership = await this.organizationMembershipService.findMembership(
      userId,
      organization.id,
    );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

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
}
