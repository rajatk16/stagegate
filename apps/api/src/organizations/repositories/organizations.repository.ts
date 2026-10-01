import { HttpStatus, Injectable } from '@nestjs/common';

import { AuditWriter } from '../../audit';
import { ApiException } from '../../common';
import { OrganizationCreation } from '../types';
import { organizationConverter } from '../converters';
import { ORGANIZATIONS_COLLECTION } from '../constants';
import { FirebaseService } from '../../firebase/services';
import { OrganizationSlugRepository } from './organizationSlugs.repository';
import { OrganizationmembershipRepository } from './organizationMembership.repository';

@Injectable()
export class OrganizationRepository {
  constructor(
    private readonly audit: AuditWriter,
    private readonly firebaseService: FirebaseService,
    private readonly organizationSlugsRepository: OrganizationSlugRepository,
    private readonly organizationMembershipRepository: OrganizationmembershipRepository,
  ) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(ORGANIZATIONS_COLLECTION)
      .withConverter(organizationConverter);
  }

  getDocumentReference(id: string) {
    return this.collection().doc(id);
  }

  async create(creation: OrganizationCreation): Promise<OrganizationCreation> {
    const { organization, ownerMembership, slugReservation } = creation;

    const organizationReference = this.getDocumentReference(organization.id);

    const membershipReference =
      this.organizationMembershipRepository.getDocumentReference(
        organization.id,
        ownerMembership.uid,
      );

    const slugReference = this.organizationSlugsRepository.getDocumentReference(
      slugReservation.slug,
    );

    const auditEvent = this.audit.prepareOrganizationCreated(
      organization.id,
      ownerMembership.uid,
      organization.createdAt,
    );

    return this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<OrganizationCreation> => {
        const existingSlug = await transaction.get(slugReference);

        if (existingSlug.exists) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'ORGANIZATION_SLUG_TAKEN',
            'This organization slug is already in use',
          );
        }

        transaction.create(organizationReference, organization);

        transaction.create(membershipReference, ownerMembership);

        transaction.create(slugReference, slugReservation);

        this.audit.append(transaction, auditEvent);

        return creation;
      },
    );
  }
}
