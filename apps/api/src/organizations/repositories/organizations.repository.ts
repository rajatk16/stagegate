import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ApiException } from '../../common';
import { organizationConverter } from '../converters';
import { ORGANIZATIONS_COLLECTION } from '../constants';
import { DiagnosticError } from '../../observalibility';
import { FirebaseService } from '../../firebase/services';
import { AuditWriter, ORGANIZATION_SETTINGS_FIELDS } from '../../audit';
import { OrganizationSlugRepository } from './organizationSlugs.repository';
import { OrganizationmembershipRepository } from './organizationMembership.repository';
import {
  getOrganizationLogoPath,
  assertOrganizationPermissions,
} from '../utils';
import {
  Organization,
  organizationSchema,
  OrganizationSettingsChanges,
  organizationSettingsChangesSchema,
} from '../models';
import {
  OrganizationScope,
  OrganizationCreation,
  OrganizationWriteResult,
  OrganizationWriteChanges,
  OrganizationWithMembership,
  OrganizationSettingsUpdateDocument,
} from '../types';

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

  updateSettings(
    scope: OrganizationScope,
    changes: OrganizationSettingsChanges,
  ): Promise<OrganizationWithMembership> {
    return this.commitSettings(
      scope,
      organizationSettingsChangesSchema.parse(changes),
    );
  }

  replaceLogo(
    scope: OrganizationScope,
    version: string | null,
  ): Promise<OrganizationWriteResult> {
    return this.commitSettings(scope, {
      logoVersion: version,
      logoStoragePath:
        version === null
          ? null
          : getOrganizationLogoPath(scope.organizationId, version),
    });
  }

  private async commitSettings(
    scope: OrganizationScope,
    patch: OrganizationWriteChanges,
  ): Promise<OrganizationWriteResult> {
    if (Object.values(patch).every((value) => value === undefined)) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ORGANIZATION_SETTINGS_UPDATE_EMPTY',
        'Provide at least one setting to update.',
      );
    }

    const organizationReference = this.getDocumentReference(
      scope.organizationId,
    );

    const membershipReference =
      this.organizationMembershipRepository.getDocumentReference(
        scope.organizationId,
        scope.actorUid,
      );

    return this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<OrganizationWriteResult> => {
        const membershipSnapshot = await transaction.get(membershipReference);
        const organizationSnapshot = await transaction.get(
          organizationReference,
        );

        const membership = membershipSnapshot.data();
        const organization = organizationSnapshot.data();

        if (!membership || !organization) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'ORGANIZATION_NOT_FOUND',
            'Organization not found.',
          );
        }

        if (
          membership.uid !== scope.actorUid ||
          membership.organizationId !== scope.organizationId ||
          organization.id !== scope.organizationId
        ) {
          throw new DiagnosticError('ORGANIZATION_STORAGE_INVARIANT_FAILED');
        }

        assertOrganizationPermissions(membership, ['organization:update']);

        const changedKeys = (
          Object.keys(patch) as Array<keyof OrganizationWriteChanges>
        ).filter(
          (key) => patch[key] !== undefined && patch[key] !== organization[key],
        );

        if (changedKeys.length === 0) {
          return {
            organization,
            membership,
            previousLogoPath: organization.logoStoragePath,
          };
        }

        const changedValues = Object.fromEntries(
          changedKeys.map((key) => [key, patch[key]]),
        );

        const updatedAt = new Date();

        const updated = organizationSchema.parse({
          ...organization,
          ...changedValues,
          updatedAt,
        });

        const documentPatch: OrganizationSettingsUpdateDocument = {
          ...changedValues,
          updatedAt: Timestamp.fromDate(updatedAt),
        };

        const auditFields = [
          ...new Set(
            changedKeys.map((key) =>
              key === 'logoVersion' || key === 'logoStoragePath'
                ? ORGANIZATION_SETTINGS_FIELDS.LOGO
                : (key as ORGANIZATION_SETTINGS_FIELDS),
            ),
          ),
        ];

        const auditEvent = this.audit.prepareOrganizationSettingsUpdated(
          scope.organizationId,
          scope.actorUid,
          auditFields,
          updatedAt,
        );

        transaction.update(organizationReference, documentPatch);
        this.audit.append(transaction, auditEvent);

        return {
          organization: updated,
          membership,
          previousLogoPath: organization.logoStoragePath,
        };
      },
    );
  }
}
