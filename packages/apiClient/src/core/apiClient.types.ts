import type z from 'zod';

export type AuthMode = 'none' | 'optional' | 'required';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export type QueryPrimitive = string | number | boolean;

export type QueryParameters = Readonly<
  Record<string, QueryPrimitive | readonly QueryPrimitive[] | null | undefined>
>;

export interface AuthTokenProvider {
  getToken(): Promise<string | null>;
}

export interface UnauthorizedContext {
  requestId: string | undefined;
}

export interface ApiClientOptions {
  baseUrl: string;
  timeoutMs?: number;
  tokenProvider?: AuthTokenProvider;
  requestIdFactory?: () => string;
  onUnauthorized?: (context: UnauthorizedContext) => void | Promise<void>;
}

export interface RequestOptions {
  signal?: AbortSignal;
  query?: QueryParameters;
  auth?: AuthMode;
  headers?: Readonly<Record<string, string>>;
}

export interface ApiRequest<TSchema extends z.ZodType> extends RequestOptions {
  method: HttpMethod;
  path: string;
  schema: TSchema;
  body?: unknown;
}

export interface RawApiRequest<TSchema extends z.ZodType> extends ApiRequest<TSchema> {
  acceptedStatuses?: readonly number[];
}
