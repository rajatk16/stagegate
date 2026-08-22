import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate, toNullableDate } from '@/common';

import { ReviewAssignment } from '../entities';
import { ReviewAssignmentStatus } from '../enums';

export const reviewAssignmentConverter: FirestoreDataConverter<ReviewAssignment> =
  {
    toFirestore: (reviewAssignment: ReviewAssignment) => ({
      ...reviewAssignment,
    }),
    fromFirestore: (snapshot) => {
      const data = snapshot.data();

      return {
        id: snapshot.id,
        eventId: data.eventId as string,
        cfpId: data.cfpId as string,
        reviewPeriodId: data.reviewPeriodId as string,
        proposalId: data.proposalId as string,
        reviewerUserId: data.reviewerUserId as string,
        status: data.status as ReviewAssignmentStatus,
        dueAt: toNullableDate(data.dueAt),
        assignedBy: data.assignedBy as string,
        assignedAt: toDate(data.assignedAt),
        startedAt: toNullableDate(data.startedAt),
        completedAt: toNullableDate(data.completedAt),
        declinedAt: toNullableDate(data.declinedAt),
        revokedAt: toNullableDate(data.revokedAt),
        revokedBy: data.revokedBy as string | null,
        revokeReason: data.revokeReason as string | null,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    },
  };
