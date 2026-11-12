import { isAxiosError } from 'axios';
import type { User } from 'firebase/auth';

import {
  accountDetailsResponseSchema,
  IDENTITY_ERROR_CODES,
  identityErrorResponseSchema,
  identityResponseSchema,
} from '@stagegate/contracts';

import { apiRequest } from '@/lib/api';

type ResponseSchema<T> = { parse(input: unknown): T };

const identityErrorCode = (error: unknown) => {
  if (!isAxiosError(error)) return undefined;

  const parsed = identityErrorResponseSchema.safeParse(error.response?.data);
  return parsed.success ? parsed.data.code : undefined;
};

const identityClient = (user: User, signal: AbortSignal) => {
  const request = async <T>(
    path: string,
    method: 'GET' | 'POST',
    schema: ResponseSchema<T>,
    forceRefresh = false,
  ) => {
    signal.throwIfAborted();
    const token = await user.getIdToken(forceRefresh);
    signal.throwIfAborted();
    return apiRequest(
      {
        url: path,
        method,
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      schema,
    );
  };

  return {
    async get<T>(path: string, schema: ResponseSchema<T>) {
      try {
        return await request(path, 'GET', schema);
      } catch (error) {
        if (!isAxiosError(error) || error.response?.status !== 401) throw error;
        return request(path, 'GET', schema, true);
      }
    },
    activate: () =>
      request('/me/activate', 'POST', identityResponseSchema, true),
  };
};

export const loadIdentity = async (
  user: User,
  signal: AbortSignal,
  justVerified: boolean,
) => {
  const client = identityClient(user, signal);

  if (justVerified) return client.activate();

  try {
    return await client.get('/me', identityResponseSchema);
  } catch (error) {
    if (
      identityErrorCode(error) ===
      IDENTITY_ERROR_CODES.ACCOUNT_ACTIVATION_REQUIRED
    ) {
      return client.activate();
    }
    throw error;
  }
};

export const fetchAccountDetails = (user: User, signal: AbortSignal) =>
  identityClient(user, signal).get('/me/account', accountDetailsResponseSchema);

export const identityFailureMessage = (error: unknown): string => {
  if (identityErrorCode(error) === IDENTITY_ERROR_CODES.IDENTITY_CONFLICT) {
    return 'Your verified email could be linked to StageGate. Contact support for help with this account.';
  }
  return "We couldn't open your StageGate workspace. Try again or sign in again.";
};
