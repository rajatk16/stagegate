import z from 'zod';
import {
  FirestoreDataConverter,
  SetOptions,
  Timestamp,
} from 'firebase-admin/firestore';

import { OrganizationDocument } from '../types';
import { DiagnosticError } from '../../observalibility';
import { Organization, organizationSchema } from '../models';

const organizationDocumentSchema = organizationSchema.extend({
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
});

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

export const organizationConverter: FirestoreDataConverter<
  Organization,
  OrganizationDocument
> = {
  toFirestore(value: unknown, options?: SetOptions): OrganizationDocument {
    rejectPartialWrite(options);

    const organization = organizationSchema.parse(value);

    return {
      ...organization,
      createdAt: Timestamp.fromDate(organization.createdAt),
      updatedAt: Timestamp.fromDate(organization.updatedAt),
    };
  },

  fromFirestore(snapshot): Organization {
    const document = organizationDocumentSchema.parse(snapshot.data());

    assertIdentity(document.id === snapshot.id);

    return {
      ...document,
      createdAt: document.createdAt.toDate(),
      updatedAt: document.updatedAt.toDate(),
    };
  },
};
