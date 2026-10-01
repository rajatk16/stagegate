import { ValidationError } from '@nestjs/common';

import { ValidationIssueDto } from '../dtos';
import { ValidationIssueCode } from '../types';

const publicFields = new Set([
  'displayName',
  'photoURL',
  'biography',
  'affiliation',
  'timezone',
  'name',
  'slug',
]);

const constraintCodes = new Map<string, ValidationIssueCode>([
  ['whitelistValidation', 'UNEXPECTED_FIELD'],
  ['isString', 'INVALID_TYPE'],
  ['isLength', 'INVALID_LENGTH'],
  ['maxLength', 'TOO_LONG'],
  ['isUrl', 'INVALID_URL'],
  ['isTimeZone', 'INVALID_TIMEZONE'],
  ['matches', 'INVALID_VALUE'],
]);

export const toValidationIssues = (
  errors: ValidationError[],
): ValidationIssueDto[] => {
  const details: ValidationIssueDto[] = [];
  const seen = new Set<string>();

  let remainingNodes = 100;

  const visit = (items: ValidationError[], parent = ''): void => {
    for (const error of items) {
      if (remainingNodes <= 0 || details.length >= 10) {
        return;
      }

      remainingNodes -= 1;

      const path = parent ? `${parent}.${error.property}` : error.property;

      const field = publicFields.has(path) ? path : '$body';

      for (const constraint of Object.keys(error.constraints ?? {})) {
        const code = constraintCodes.get(constraint) ?? 'INVALID_VALUE';

        const key = `${field}:${code}`;

        if (!seen.has(key)) {
          seen.add(key);
          details.push({ field, code });
        }

        if (details.length >= 10) {
          return;
        }
      }

      visit(error.children ?? [], path);
    }
  };

  visit(errors);

  return details.length > 0
    ? details
    : [{ field: '$body', code: 'INVALID_VALUE' }];
};
