import { Injectable } from '@nestjs/common';
import { FieldValue, Transaction } from 'firebase-admin/firestore';

import {
  ORGANIZATION_ROLE,
  CreateOrganizationRequest,
} from '@stagegate/contracts';

import { FirebaseService } from '../../firebase/services/firebase.service';
import { OrganizationSlugRepository } from './organizationSlug.repository';
import { OrganizationMembershipRepository } from './organizationMembership.repository';
import {
  OrganizationDocument,
  organizationConverter,
} from '../converters/organization.converter';

@Injectable()
export class OrganizationsRepository {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly slugRepository: OrganizationSlugRepository,
    private readonly membershipRepository: OrganizationMembershipRepository,
  ) {}

  private collection() {
    return this.firebase.firestore
      .collection('orgs')
      .withConverter(organizationConverter);
  }

  private organizationRef(orgId: string) {
    return this.collection().doc(orgId);
  }

  async find(transaction: Transaction, orgId: string) {
    return (await transaction.get(this.organizationRef(orgId))).data();
  }

  async findMany(
    transaction: Transaction,
    orgIds: string[],
  ): Promise<Map<string, OrganizationDocument>> {
    const results = new Map<string, OrganizationDocument>();

    if (!orgIds.length) return results;

    const snapshots = await transaction.getAll(
      ...orgIds.map((id) => this.organizationRef(id)),
    );

    for (const snapshot of snapshots) {
      const organization = snapshot.data();
      if (organization) results.set(snapshot.id, organization);
    }

    return results;
  }

  createWithOwner(
    transaction: Transaction,
    userId: string,
    { id, name, slug }: CreateOrganizationRequest,
    createFingerprint: string,
  ): void {
    transaction.create(this.slugRepository.slugRef(slug), { orgId: id });
    transaction.create(this.organizationRef(id), {
      name,
      slug,
      createdByUserId: userId,
      createFingerprint,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(this.membershipRepository.memberRef(id, userId), {
      orgId: id,
      userId,
      role: ORGANIZATION_ROLE.OWNER,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
    });
  }
}
