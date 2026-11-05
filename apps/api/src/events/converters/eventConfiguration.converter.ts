import z from 'zod';
import {
  Timestamp,
  SetOptions,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { DiagnosticError } from '../../observalibility/errors/diagnostic.error';
import {
  EventConfiguration,
  eventConfigurationSchema,
  eventConfigurationObjectSchema,
} from '../models/eventConfiguration.model';

type EventConfigurationDocument = Omit<
  EventConfiguration,
  'createdAt' | 'updatedAt'
> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const documentSchema = eventConfigurationObjectSchema.extend({
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
});

export const eventConfigurationConverter: FirestoreDataConverter<
  EventConfiguration,
  EventConfigurationDocument
> = {
  toFirestore(
    value: unknown,
    options?: SetOptions,
  ): EventConfigurationDocument {
    if (options !== undefined) {
      throw new DiagnosticError(
        'EVENT_CONFIGURATION_PARTIAL_WRITE_UNSUPPORTED',
      );
    }

    const record = eventConfigurationSchema.parse(value);

    return {
      ...record,
      createdAt: Timestamp.fromDate(record.createdAt),
      updatedAt: Timestamp.fromDate(record.updatedAt),
    };
  },

  fromFirestore(snapshot): EventConfiguration {
    const document = documentSchema.safeParse(snapshot.data());

    if (!document.success) {
      throw new DiagnosticError('EVENT_CONFIGURATION_STORAGE_INVARIANT_FAILED');
    }

    const value = document.data;

    const expectedPath = `organizations/${value.organizationId}/events/${value.eventId}/configuration/${value.id}`;

    if (snapshot.ref.path !== expectedPath) {
      throw new DiagnosticError('EVENT_CONFIGURATION_STORAGE_INVARIANT_FAILED');
    }

    const record = eventConfigurationSchema.safeParse({
      ...value,
      createdAt: value.createdAt.toDate(),
      updatedAt: value.updatedAt.toDate(),
    });

    if (!record.success) {
      throw new DiagnosticError('EVENT_CONFIGURATION_STORAGE_INVARIANT_FAILED');
    }

    return record.data;
  },
};
