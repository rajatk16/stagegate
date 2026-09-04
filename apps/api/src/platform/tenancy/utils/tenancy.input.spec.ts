import { describe, expect, it } from '@jest/globals';

import { parseCreateOrganization, parseOrganizationId } from './tenancy.input';

describe('tenancy input utilities', () => {
  describe('parseCreateOrganization', () => {
    it('trims and returns a valid organization name', () => {
      expect(parseCreateOrganization({ name: '  StageGate Conf  ' })).toEqual({
        name: 'StageGate Conf',
      });
    });

    it.each([
      [{}, 'name'],
      [{ name: 'A' }, 'name'],
      [{ name: 'StageGate', plan: 'enterprise' }, 'body'],
    ])('rejects invalid organization input %#', (body, path) => {
      expect(() => parseCreateOrganization(body)).toThrow(
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
          fields: expect.arrayContaining([
            expect.objectContaining({
              path,
              code: 'INVALID_FIELD',
            }),
          ]),
        }),
      );
    });
  });

  describe('parseOrganizationId', () => {
    it('accepts a Firestore-style organization id', () => {
      expect(parseOrganizationId('abcDEF1234567890wxyz')).toBe('abcDEF1234567890wxyz');
    });

    it.each(['', 'short', 'abcDEF1234567890wxy-', 'abcDEF1234567890wxyz1'])(
      'rejects invalid organization id: %p',
      (organizationId) => {
        expect(() => parseOrganizationId(organizationId)).toThrow(
          expect.objectContaining({
            code: 'VALIDATION_ERROR',
          }),
        );
      },
    );
  });
});
