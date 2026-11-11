import {
  Timestamp,
  PartialWithFieldValue,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import {
  CreateOrganizationRequest,
  createOrganizationRequestSchema,
} from '@stagegate/contracts';

export type OrganizationDocument = Omit<CreateOrganizationRequest, 'id'> & {
  createdByUserId: string;
  createFingerprint: string;
  createdAt: Timestamp;
};

const isUserId = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);

export const organizationConverter: FirestoreDataConverter<
  OrganizationDocument,
  OrganizationDocument
> = {
  toFirestore<T extends PartialWithFieldValue<OrganizationDocument>>(
    value: T,
  ): T {
    return value;
  },
  fromFirestore(snapshot) {
    const { name, slug } = createOrganizationRequestSchema.parse({
      id: snapshot.id,
      name: snapshot.get('name'),
      slug: snapshot.get('slug'),
    });

    const createdByUserId: unknown = snapshot.get('createdByUserId');
    const createFingerprint: unknown = snapshot.get('createFingerprint');
    const createdAt: unknown = snapshot.get('createdAt');
    if (
      !isUserId(createdByUserId) ||
      typeof createFingerprint !== 'string' ||
      !/^[a-f0-9]{64}$/.test(createFingerprint) ||
      !(createdAt instanceof Timestamp)
    ) {
      throw new Error('Invalid stored organization.');
    }
    return { name, slug, createdByUserId, createFingerprint, createdAt };
  },
};
