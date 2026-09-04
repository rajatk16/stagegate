import { describe, expect, it } from '@jest/globals';

import { TenancyError } from './tenancy.error';

describe('TenancyError', () => {
  it('stores the tenancy error code as the error message', () => {
    const error = new TenancyError('ORGANIZATION_NOT_FOUND');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('TenancyError');
    expect(error.message).toBe('ORGANIZATION_NOT_FOUND');
    expect(error.code).toBe('ORGANIZATION_NOT_FOUND');
    expect(error.fields).toEqual([]);
  });

  it('preserves validation field details', () => {
    const fields = [
      {
        path: 'name',
        code: 'INVALID_FIELD' as const,
        message: 'Invalid, missing, or unsupported field.',
      },
    ];

    const error = new TenancyError('VALIDATION_ERROR', fields);

    expect(error.fields).toBe(fields);
  });
});
