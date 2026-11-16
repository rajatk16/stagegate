import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  apiErrorResponseSchema,
  apiResponseSchema,
  apiSuccessResponseSchema,
  cursorPaginatedSchema,
  cursorPaginationQuerySchema,
  healthResponseSchema,
  offsetPaginatedSchema,
  offsetPaginationQuerySchema,
  requestIdSchema,
  resourceIdSchema,
  slugSchema,
  timestampSchema,
} from '../src/index.js';

const meta = {
  requestId: 'request-123',

  timestamp: '2026-11-16T10:00:00.000Z',
};

const itemSchema = z.object({
  id: z.string(),

  name: z.string(),
});

describe('API success contracts', () => {
  const schema = apiSuccessResponseSchema(itemSchema);

  it('accepts a valid success response', () => {
    const result = schema.parse({
      success: true,

      data: {
        id: '123',

        name: 'StageGate',
      },

      meta,
    });

    expect(result.data.name).toBe('StageGate');
  });

  it('rejects missing response metadata', () => {
    expect(
      schema.safeParse({
        success: true,

        data: {
          id: '123',

          name: 'StageGate',
        },
      }).success,
    ).toBe(false);
  });

  it('rejects invalid data', () => {
    expect(
      schema.safeParse({
        success: true,

        data: {
          id: 123,

          name: 'StageGate',
        },

        meta,
      }).success,
    ).toBe(false);
  });

  it('rejects missing data', () => {
    expect(
      schema.safeParse({
        success: true,

        meta,
      }).success,
    ).toBe(false);
  });

  it('accepts null data when explicitly allowed', () => {
    const nullableSchema = apiSuccessResponseSchema(z.null());

    expect(
      nullableSchema.parse({
        success: true,

        data: null,

        meta,
      }).data,
    ).toBeNull();
  });

  it('accepts additive response properties', () => {
    const result = schema.safeParse({
      success: true,

      data: {
        id: '123',

        name: 'StageGate',

        description: 'Additional field',
      },

      meta,

      additionalField: true,
    });

    expect(result.success).toBe(true);
  });
});

describe('API error contracts', () => {
  const errorResponse = {
    success: false,

    error: {
      code: 'NOT_FOUND',

      message: 'Resource not found.',
    },

    meta,
  };

  it('accepts a valid error response', () => {
    expect(apiErrorResponseSchema.safeParse(errorResponse).success).toBe(true);
  });

  it('accepts future business error codes', () => {
    expect(
      apiErrorResponseSchema.safeParse({
        ...errorResponse,

        error: {
          code: 'CFP_CLOSED',

          message: 'The CFP is closed.',
        },
      }).success,
    ).toBe(true);
  });

  it('accepts JSON-compatible error details', () => {
    expect(
      apiErrorResponseSchema.safeParse({
        ...errorResponse,

        error: {
          ...errorResponse.error,

          details: [
            {
              field: 'name',

              message: 'Name is required.',
            },
          ],
        },
      }).success,
    ).toBe(true);
  });

  it('rejects numeric error codes', () => {
    expect(
      apiErrorResponseSchema.safeParse({
        ...errorResponse,

        error: {
          code: 404,

          message: 'Not found.',
        },
      }).success,
    ).toBe(false);
  });

  it('rejects non-JSON error details', () => {
    expect(
      apiErrorResponseSchema.safeParse({
        ...errorResponse,

        error: {
          ...errorResponse.error,

          details: () => 'invalid',
        },
      }).success,
    ).toBe(false);
  });

  it('supports discriminated response unions', () => {
    const schema = apiResponseSchema(itemSchema);

    const result = schema.parse(errorResponse);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe('NOT_FOUND');
    }
  });
});

describe('Pagination contracts', () => {
  it('applies offset pagination defaults', () => {
    expect(offsetPaginationQuerySchema.parse({})).toEqual({
      page: 1,

      pageSize: 20,
    });
  });

  it('rejects invalid page numbers', () => {
    expect(
      offsetPaginationQuerySchema.safeParse({
        page: 0,
      }).success,
    ).toBe(false);
  });

  it('rejects excessive page sizes', () => {
    expect(
      offsetPaginationQuerySchema.safeParse({
        pageSize: 101,
      }).success,
    ).toBe(false);
  });

  it('validates offset-paginated results', () => {
    const schema = offsetPaginatedSchema(itemSchema);

    expect(
      schema.safeParse({
        items: [],

        pagination: {
          page: 1,

          pageSize: 20,

          totalItems: 0,

          totalPages: 0,

          hasNextPage: false,

          hasPreviousPage: false,
        },
      }).success,
    ).toBe(true);
  });

  it('applies cursor pagination defaults', () => {
    expect(cursorPaginationQuerySchema.parse({})).toEqual({
      limit: 20,
    });
  });

  it('validates cursor-paginated results', () => {
    const schema = cursorPaginatedSchema(itemSchema);

    expect(
      schema.safeParse({
        items: [],

        pagination: {
          limit: 20,

          nextCursor: null,

          hasNextPage: false,
        },
      }).success,
    ).toBe(true);
  });

  it('rejects inconsistent cursor metadata', () => {
    const schema = cursorPaginatedSchema(itemSchema);

    expect(
      schema.safeParse({
        items: [],

        pagination: {
          limit: 20,

          nextCursor: null,

          hasNextPage: true,
        },
      }).success,
    ).toBe(false);
  });
});

describe('Common identifiers', () => {
  it('accepts a valid resource ID', () => {
    expect(resourceIdSchema.safeParse('org-123').success).toBe(true);
  });

  it('rejects resource IDs containing slashes', () => {
    expect(resourceIdSchema.safeParse('org/123').success).toBe(false);
  });

  it.each(['react-india', 'stagegate', 'conference-2027'])('accepts slug %s', (slug) => {
    expect(slugSchema.safeParse(slug).success).toBe(true);
  });

  it.each(['React India', '-react-india', 'react--india', 'react_india'])(
    'rejects slug %s',
    (slug) => {
      expect(slugSchema.safeParse(slug).success).toBe(false);
    },
  );

  it('rejects invalid request IDs', () => {
    expect(requestIdSchema.safeParse('invalid request id').success).toBe(false);
  });

  it('validates ISO timestamps', () => {
    expect(timestampSchema.safeParse(meta.timestamp).success).toBe(true);
  });
});

describe('Health contracts', () => {
  it.each(['ok', 'unavailable'])('accepts health status %s', (status) => {
    expect(
      healthResponseSchema.safeParse({
        status,

        timestamp: meta.timestamp,
      }).success,
    ).toBe(true);
  });

  it('rejects unknown health statuses', () => {
    expect(
      healthResponseSchema.safeParse({
        status: 'unknown',

        timestamp: meta.timestamp,
      }).success,
    ).toBe(false);
  });
});
