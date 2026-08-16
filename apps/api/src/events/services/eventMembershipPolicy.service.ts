import { HttpStatus, Injectable } from '@nestjs/common';

import { EventRole } from '@/auth';
import { ErrorCode, ApplicationException } from '@/common';

import { EventMembership } from '../entities';

@Injectable()
export class EventMembershipPolicyService {
  assertCanChangeRole(
    actorUserId: string,
    targetMembership: EventMembership,
    nextRole: EventRole,
    activeChairCount: number,
  ): void {
    if (
      targetMembership.role === EventRole.PROGRAM_CHAIR &&
      nextRole !== EventRole.PROGRAM_CHAIR &&
      activeChairCount <= 1
    ) {
      throw new ApplicationException(
        ErrorCode.EVENT_LAST_CHAIR_REQUIRED,
        HttpStatus.CONFLICT,
        'An event must have at least one active program chair.',
      );
    }

    if (actorUserId === targetMembership.userId) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'You cannot manage your own event membership through this endpoint.',
      );
    }
  }

  assertCanRemove(
    actorUserId: string,
    targetMembership: EventMembership,
    activeChairCount: number,
  ): void {
    if (
      targetMembership.role === EventRole.PROGRAM_CHAIR &&
      activeChairCount <= 1
    ) {
      throw new ApplicationException(
        ErrorCode.EVENT_LAST_CHAIR_REQUIRED,
        HttpStatus.CONFLICT,
        'An event must have at least one active program chair.',
      );
    }
    if (targetMembership.userId === actorUserId) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'You cannot remove yourself from the event.',
      );
    }
  }

  assertActorCanManageMembers(actorMembership: EventMembership) {
    if (actorMembership.role !== EventRole.PROGRAM_CHAIR) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'You are not authorized to manage event members.',
      );
    }
  }
}
