import {
  FirestoreDataConverter,
  PartialWithFieldValue,
} from 'firebase-admin/firestore';

import { identityConflict } from '../utils/authOperation.util';
import { IdentityMapping } from '../types/identityMapping.type';

export const identityMappingConverter: FirestoreDataConverter<
  IdentityMapping,
  IdentityMapping
> = {
  toFirestore<T extends PartialWithFieldValue<IdentityMapping>>(mapping: T): T {
    return mapping;
  },
  fromFirestore(snapshot) {
    const userId: unknown = snapshot.get('userId');
    if (typeof userId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(userId)) {
      throw identityConflict();
    }
    return {
      userId,
    };
  },
};
