import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { ReviewCriterion } from '../entities';

export const reviewCriterionConverter: FirestoreDataConverter<ReviewCriterion> =
  {
    toFirestore: (reviewCriterion: ReviewCriterion) => ({
      ...reviewCriterion,
    }),
    fromFirestore: (snapshot) => {
      const data = snapshot.data();

      return {
        id: snapshot.id,
        label: data.label as string,
        description: data.description as string | null,
        weight: data.weight as number,
        minimumScore: data.minimumScore as number,
        maximumScore: data.maximumScore as number,
        displayOrder: data.displayOrder as number,
        required: data.required as boolean,
      };
    },
  };
