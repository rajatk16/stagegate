import z from 'zod';

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_PAGE_SIZE = 100;

export const pageSizeSchema = z.number().int().min(1).max(MAX_PAGE_SIZE);

export const offsetPaginationQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: pageSizeSchema.default(DEFAULT_PAGE_SIZE),
});

export const offsetPaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: pageSizeSchema,
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const offsetPaginatedSchema = <TSchema extends z.ZodType>(itemSchema: TSchema) =>
  z.object({
    items: z.array(itemSchema),
    pagination: offsetPaginationMetaSchema,
  });

export const cursorSchema = z.string().min(1).max(2048);

export const cursorPaginationQuerySchema = z.object({
  cursor: cursorSchema.optional(),
  limit: pageSizeSchema.default(DEFAULT_PAGE_SIZE),
});

export const cursorPaginationMetaSchema = z
  .object({
    limit: pageSizeSchema,
    nextCursor: cursorSchema.nullable(),
    hasNextPage: z.boolean(),
  })
  .refine((value) => value.hasNextPage === (value.nextCursor !== null), {
    path: ['nextCursor'],
    message: 'Next cursor must match the pagination state.',
  });

export const cursorPaginatedSchema = <TSchema extends z.ZodType>(itemSchema: TSchema) =>
  z.object({
    items: z.array(itemSchema),
    pagination: cursorPaginationMetaSchema,
  });

export type OffsetPaginationQuery = z.infer<typeof offsetPaginationQuerySchema>;

export type OffsetPaginationMeta = z.infer<typeof offsetPaginationMetaSchema>;

export type CursorPaginationQuery = z.infer<typeof cursorPaginationQuerySchema>;

export type CursorPaginationMeta = z.infer<typeof cursorPaginationMetaSchema>;

export interface OffsetPaginated<T> {
  items: T[];
  pagination: OffsetPaginationMeta;
}

export interface CursorPaginated<T> {
  items: T[];
  pagination: CursorPaginationMeta;
}
