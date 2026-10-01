import z from 'zod';
import {
  FirestoreDataConverter,
  Timestamp,
  SetOptions,
} from 'firebase-admin/firestore';

import { OrganizationSlugDocument } from '../types';
import { DiagnosticError } from '../../observalibility';
import { OrganizationSlug, organizationSlugSchema } from '../models';

const slugDocumentSchema = organizationSlugSchema.extend({
  createdAt: z.instanceof(Timestamp),
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

export const organizationSlugConverter: FirestoreDataConverter<
  OrganizationSlug,
  OrganizationSlugDocument
> = {
  toFirestore(value: unknown, options?: SetOptions): OrganizationSlugDocument {
    rejectPartialWrite(options);

    const reservation = organizationSlugSchema.parse(value);

    return {
      ...reservation,
      createdAt: Timestamp.fromDate(reservation.createdAt),
    };
  },

  fromFirestore(snapshot): OrganizationSlug {
    const document = slugDocumentSchema.parse(snapshot.data());

    assertIdentity(document.slug === snapshot.id);

    return {
      ...document,
      createdAt: document.createdAt.toDate(),
    };
  },
};
