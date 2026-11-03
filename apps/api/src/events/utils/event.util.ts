import { HttpStatus } from '@nestjs/common';

import { ApiException } from '../../common/exceptions/api.exception';
import {
  EventIdentity,
  eventIdentitySchema,
} from '../models/eventIdentity.model';

export const parseEventIdentity = (value: unknown): EventIdentity => {
  const parsed = eventIdentitySchema.safeParse(value);

  if (!parsed.success) {
    throw new ApiException(
      HttpStatus.BAD_REQUEST,
      'EVENT_SCOPE_INVALID',
      'A valid actor UID, organization ID, and event ID are required.',
    );
  }

  return parsed.data;
};
