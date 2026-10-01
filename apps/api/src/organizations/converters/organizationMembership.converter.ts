import z from 'zod';
import {
  Timestamp,
  SetOptions,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { DiagnosticError } from '../../observalibility';
import { OrganizationMembershipDocument } from '../types';
import {
  OrganizationMembership,
  organizationMembershipSchema,
} from '../models';
import {
  ORGANIZATIONS_COLLECTION,
  ORGANIZATION_MEMBERSHIPS_COLLECTION,
} from '../constants';

const rejectPartialWrite = (options?: SetOptions): void => {
  if (options !== undefined) {
    throw new DiagnosticError('ORGANIZATION_PARTIAL_WRITE_UNSUPPORTED');
  }
};

const assertIdentity = (valid: boolean): void => {
  if (!valid) {
    throw new DiagnosticError('ORGANIZATION_STORAGE_INVARIANT_FAILED');
  }
};

const membershipDocumentSchema = organizationMembershipSchema.extend({
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
});

export const organizationMembershipConverter: FirestoreDataConverter<
  OrganizationMembership,
  OrganizationMembershipDocument
> = {
  toFirestore(
    value: unknown,
    options?: SetOptions,
  ): OrganizationMembershipDocument {
    rejectPartialWrite(options);

    const membership = organizationMembershipSchema.parse(value);

    return {
      ...membership,
      createdAt: Timestamp.fromDate(membership.createdAt),
      updatedAt: Timestamp.fromDate(membership.updatedAt),
    };
  },
  fromFirestore(snapshot): OrganizationMembership {
    const document = membershipDocumentSchema.parse(snapshot.data());

    assertIdentity(
      snapshot.ref.path ===
        `${ORGANIZATIONS_COLLECTION}/${document.organizationId}/${ORGANIZATION_MEMBERSHIPS_COLLECTION}/${document.uid}`,
    );

    return {
      ...document,
      createdAt: document.createdAt.toDate(),
      updatedAt: document.updatedAt.toDate(),
    };
  },
};
