import { User } from "firebase/auth";

import {
  ApiError,
  apiRequest,
  firebaseAuth,
  ApiRequestOptions
} from '@/lib'

export const authenticatedApiRequest = async (
  user: User,
  path: string,
  options: ApiRequestOptions = {}
): Promise<unknown> => {
  const assertCurrentSession = () => {
    options.signal?.throwIfAborted();

    if (firebaseAuth.currentUser !== user) {
      throw new ApiError(
        "Your session changed. Sign in again to continue.",
        "http",
        401
      );
    }
  };

  assertCurrentSession();

  const token = await user.getIdToken();

  assertCurrentSession();

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const result = await apiRequest(path, {
    ...options,
    headers
  });

  assertCurrentSession();

  return result;
}
