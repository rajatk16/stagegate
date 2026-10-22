import { HttpStatus } from '@nestjs/common';

import { EVENT_STATUS } from '../../events/enums';
import { ApiException } from '../../common/exceptions';

const allowedTransitions: Readonly<
  Record<EVENT_STATUS, readonly EVENT_STATUS[]>
> = {
  DRAFT: [EVENT_STATUS.ARCHIVED, EVENT_STATUS.PUBLISHED],
  PUBLISHED: [EVENT_STATUS.ARCHIVED],
  ARCHIVED: [],
};

export const assertEventStatusTransition = (
  previousStatus: EVENT_STATUS,
  nextStatus: EVENT_STATUS,
): void => {
  if (previousStatus === nextStatus) return;

  if (!allowedTransitions[previousStatus].includes(nextStatus)) {
    throw new ApiException(
      HttpStatus.CONFLICT,
      'EVENT_STATUS_TRANSITION_NOT_ALLOWED',
      `Cannot change an event from ${previousStatus} to ${nextStatus}`,
    );
  }
};
