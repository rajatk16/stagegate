import { Transaction } from 'firebase-admin/firestore';
import { ConflictException, Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase/firebase.service';

import { CreateOrganizationDto } from './dto';
import { OrganizationRepository } from './repositories';
import { createOrganizationFactory } from './organization.factory';
import { OrganizationMembershipRepository } from './memberships/repositories';
import { createMembershipFactory } from './memberships/organizationMembership.factory';
import { OrganizationSlugRepository } from './slugs/repositories/organizationSlug.repository';
import { createOrganizationSlugFactory } from './slugs/organizationSlug.factory';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationSlugRepository: OrganizationSlugRepository,
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
  ) {}

  async createOrganization(dto: CreateOrganizationDto, userId: string) {
    const organization = createOrganizationFactory(dto, userId);

    const membership = createMembershipFactory(organization.id, userId);

    const slugReservation = createOrganizationSlugFactory(
      organization.slug,
      organization.id,
    );

    const firestore = this.firebaseService.getFirestore();

    await firestore.runTransaction(async (transaction: Transaction) => {
      const slugRef = this.organizationSlugRepository.getDocumentReference(
        organization.slug,
      );

      const slugDocument = await transaction.get(slugRef);

      if (slugDocument.exists) {
        throw new ConflictException(
          'Organization with this slug already exists',
        );
      }

      const organizationRef = this.organizationRepository.getDocumentReference(
        organization.id,
      );

      const membershipRef =
        this.organizationMembershipRepository.getDocumentReference(
          membership.id,
        );

      transaction.set(slugRef, slugReservation);

      transaction.set(organizationRef, organization);

      transaction.set(membershipRef, membership);
    });

    return organization;
  }
}
