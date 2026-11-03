import { HttpStatus, InternalServerErrorException } from '@nestjs/common';

import { EVENT_STATUS } from '../../events/enums/eventStatus.enum';
import { ApiException } from '../../common/exceptions/api.exception';
import { WindowEvent } from '../types/windowEvent.type';
import { SubmissionWindowState } from '../enums/submissionWindowState.enum';

export const getSubmissionWindowState = (
  event: WindowEvent,
  now: Date,
): SubmissionWindowState => {
  if (!Number.isFinite(now.getTime())) {
    throw new InternalServerErrorException('Server time is invalid.');
  }

  if (event.status === EVENT_STATUS.ARCHIVED) {
    return SubmissionWindowState.ARCHIVED;
  }

  if (event.status !== EVENT_STATUS.PUBLISHED) {
    return SubmissionWindowState.UNPUBLISHED;
  }

  if (event.submissionOpensAt === null || event.submissionClosesAt === null) {
    return SubmissionWindowState.UNCONFIGURED;
  }

  if (now.getTime() < event.submissionOpensAt.getTime()) {
    return SubmissionWindowState.NOT_OPEN;
  }

  if (now.getTime() >= event.submissionClosesAt.getTime()) {
    return SubmissionWindowState.CLOSED;
  }

  return SubmissionWindowState.OPEN;
};

const messages: Record<Exclude<SubmissionWindowState, 'OPEN'>, string> = {
  UNPUBLISHED: 'Submissions require a published event.',
  ARCHIVED: 'Archived events do not accept submissions.',
  UNCONFIGURED: 'The submission window has not been configured.',
  NOT_OPEN: 'The submission window has not opened.',
  CLOSED: 'The submission window has closed.',
};

export const assertSubmissionWindowOpen = (
  event: WindowEvent,
  now: Date,
): void => {
  const state = getSubmissionWindowState(event, now);

  if (state !== 'OPEN') {
    throw new ApiException(
      HttpStatus.CONFLICT,
      'SUBMISSION_WINDOW_' + state,
      messages[state],
    );
  }
};
