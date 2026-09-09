import { z } from 'zod';

import { environment } from '../../config/environment';
import { expireAuthSession, getAuthIdToken } from '../auth';

const apiProblemSchema = z.looseObject({
  title: z.string(),
  status: z.number(),
  detail: z.string(),
  code: z.string(),
  requestId: z.string().optional(),
});

export type ApiProblem = z.infer<typeof apiProblemSchema>;

export class ApiError extends Error {
  constructor(readonly problem: ApiProblem) {
    super(problem.detail);
    this.name = 'ApiError';
  }
}

const readProblem = async (response: Response): Promise<ApiProblem> => {
  try {
    const body = (await response.json()) as unknown;
    const result = apiProblemSchema.safeParse(body);

    if (result.success) {
      return result.data;
    }
  } catch {
    // Fall throug to generic problem.
  }

  return {
    title: 'Request failed',
    status: response.status,
    detail: 'The request could not be completed.',
    code: 'UNKNOWN_ERROR',
  };
};

export const apiRequest = async (path: string, init: RequestInit = {}): Promise<unknown> => {
  const idToken = await getAuthIdToken();
  const headers = new Headers(init.headers);

  headers.set('Authorization', `Bearer ${idToken}`);
  headers.set('Accept', 'application/json');

  if (init.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${environment.apiBaseUrl}/api/v1/${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const problem = await readProblem(response);

    if (response.status === 401) {
      try {
        await expireAuthSession();
      } catch {
        // The original API error remains the useful error
      }
    }

    throw new ApiError(problem);
  }

  if (response.status === 204) {
    return undefined;
  }

  return (await response.json()) as unknown;
};
