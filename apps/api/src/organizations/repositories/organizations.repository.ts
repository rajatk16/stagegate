import { HttpStatus, Injectable } from '@nestjs/common';

import { AuditWriter } from '../../audit';
import { ApiException } from '../../common';
import { OrganizationCreation } from '../types';
import { organizationConverter } from '../converters';
import { ORGANIZATIONS_COLLECTION } from '../constants';
import { DiagnosticError } from '../../observalibility';
import { FirebaseService } from '../../firebase/services';
import { Organization, organizationSchema } from '../models';
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

  async findByIds(ids: readonly string[]): Promise<Map<string, Organization>> {
    const organizations = new Map<string, Organization>();

    if (ids.length === 0) {
      return organizations;
    }

    const references = [...new Set(ids)].map((id) =>
      this.getDocumentReference(id),
    );

    const snapshots = await this.firebaseService.firestore.getAll(
      ...references,
    );

    for (const snapshot of snapshots) {
      if (!snapshot.exists) {
        throw new DiagnosticError('ORGANIZATION_STORAGE_INVARIANT_FAILED');
      }

      const organization = organizationSchema.parse(snapshot.data());

      organizations.set(organization.id, organization);
    }

    return organizations;
  }

  async findById(id: string): Promise<Organization | null> {
    const snapshot = await this.getDocumentReference(id).get();

    return snapshot.data() ?? null;
  }
}
