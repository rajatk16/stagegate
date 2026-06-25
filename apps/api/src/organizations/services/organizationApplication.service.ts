import { Timestamp } from 'firebase-admin/firestore';
import { ConflictException, Injectable } from '@nestjs/common';

import { normalizeSlug } from '@/common/utils';
import { FirebaseService } from '@/firebase/firebase.service';

import { Organization } from '../entities';
import { OrganizationMapper } from '../mappers';
import { createOrganizationSlugFactory } from '../factories';
import { OrganizationDetailsDto, UpdateOrganizationDto } from '../dtos';
import {
  OrganizationService,
  OrganizationMembershipService,
} from '../services';
import {
  OrganizationRepository,
  OrganizationSlugRepository,
} from '../repositories';

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
}
