import z from 'zod';
import {
  Timestamp,
  SetOptions,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { EventMembershipDocument } from '../types';
import { DiagnosticError } from '../../observalibility/errors';
import { EventMembership, eventMembershipSchema } from '../models';

const membershipDocumentSchema = eventMembershipSchema.extend({
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
});

const rejectPartialWrite = (options?: SetOptions): void => {
  if (options !== undefined) {
    throw new DiagnosticError('EVENT_PARTIAL_WRITE_UNSUPPORTED');
  }
};

const assertIdentity = (valid: boolean): void => {
  if (!valid) {
    throw new DiagnosticError('EVENT_STORAGE_INVARIANT_FAILED');
  }
};

export const eventMembershipConverter: FirestoreDataConverter<
  EventMembership,
  EventMembershipDocument
> = {
  toFirestore(value: unknown, options?: SetOptions): EventMembershipDocument {
    rejectPartialWrite(options);

    const membership = eventMembershipSchema.parse(value);

    return {
      ...membership,
      createdAt: Timestamp.fromDate(membership.createdAt),
      updatedAt: Timestamp.fromDate(membership.updatedAt),
    };
  },
  fromFirestore(snapshot): EventMembership {
    const membership = membershipDocumentSchema.parse(snapshot.data());

    assertIdentity(
      snapshot.ref.path ===
        `organizations/${membership.organizationId}/events/${membership.eventId}/eventMemberships/${membership.uid}`,
    );

    return {
      ...membership,
      createdAt: membership.createdAt.toDate(),
      updatedAt: membership.updatedAt.toDate(),
    };
  },
};
