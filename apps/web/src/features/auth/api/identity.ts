import { isAxiosError } from 'axios';
import type { User } from 'firebase/auth';

import {
  IDENTITY_ERROR_CODES,
  identityErrorResponseSchema,
  identityResponseSchema,
} from '@stagegate/contracts';

import { apiRequest } from '@/lib/api';

const identityErrorCode = (error: unknown) => {
  if (!isAxiosError(error)) return undefined;

  const parsed = identityErrorResponseSchema.safeParse(error.response?.data);
  return parsed.success ? parsed.data.code : undefined;
};

export const loadIdentity = async (
  user: User,
  signal: AbortSignal,
  justVerified: boolean,
) => {
  const request = async (
    path: string,
    method: 'GET' | 'POST',
    forceRefresh: boolean,
  ) => {
    signal.throwIfAborted();
    const token = await user.getIdToken(forceRefresh);
    signal.throwIfAborted();
    return apiRequest(
      {
        url: path,
        method,
        signal,
        headers: { Authorization: `Bearer ${token}` },
      },
      identityResponseSchema,
    );
  };

  if (justVerified) return request('/me/activate', 'POST', true);

  try {
    try {
      return await request('/me', 'GET', false);
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 401) throw error;
      return await request('/me', 'GET', true);
    }
  } catch (error) {
    if (
      identityErrorCode(error) ===
      IDENTITY_ERROR_CODES.ACCOUNT_ACTIVATION_REQUIRED
    ) {
      return request('/me/activate', 'POST', true);
    }
    throw error;
  }
};

export const identityFailureMessage = (error: unknown): string => {
  if (identityErrorCode(error) === IDENTITY_ERROR_CODES.IDENTITY_CONFLICT) {
    return 'Your verified email could be linked to StageGate. Contact support for help with this account.';
  }
  return "We couldn't open your StageGate workspace. Try again or sign in again.";
};
