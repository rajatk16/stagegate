import {
  PartialWithFieldValue,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { organizationIdSchema } from '@stagegate/contracts';

type SlugReservation = { orgId: string };

export const slugReservationConverter: FirestoreDataConverter<
  SlugReservation,
  SlugReservation
> = {
  toFirestore<T extends PartialWithFieldValue<SlugReservation>>(value: T): T {
    return value;
  },
  fromFirestore(snapshot) {
    return { orgId: organizationIdSchema.parse(snapshot.get('orgId')) };
  },
};
