import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../../common/exceptions/api.exception';
import { EventConfiguration } from '../models/eventConfiguration.model';

export const configurationInvalid = (): ApiException =>
  new ApiException(
    HttpStatus.BAD_REQUEST,
    'EVENT_CONFIGURATION_INVALID',
    'Check the configuration values',
  );

export const assertConfigurationUpdateAllowed = (
  current: EventConfiguration,
  next: EventConfiguration,
): void => {
  if (
    current.everReferenced &&
    (current.name !== next.name ||
      current.description !== next.description ||
      current.durationMinutes !== next.durationMinutes)
  ) {
    throw new ApiException(
      HttpStatus.CONFLICT,
      'EVENT_CONFIGURATION_IN_USE',
      'This value has been referenced by a submission. Retire it and create a replacement.',
    );
  }
};

export const assertConfigurationDeleteable = (current: EventConfiguration) => {
  if (current.everReferenced) {
    throw new ApiException(
      HttpStatus.CONFLICT,
      'EVENT_CONFIGURATION_IN_USE',
      'Referenced configuration cannot be deleted. Retire it instead.',
    );
  }
};

export const toConfigurationResponse = (record: EventConfiguration) => ({
  ...record,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
});
