import { createContext, useContext } from 'react';

import type {
  IdentityResponse,
  AccountDetailsResponse,
  UserProfileResponse,
  UpdateUserProfileRequest,
} from '@stagegate/contracts';

export type Session =
  | {
      status: 'loading' | 'signed-out' | 'unavailable';
    }
  | {
      status: 'verify';
      email: string;
      uid: string;
    }
  | {
      status: 'error';
      message: string;
    }
  | {
      status: 'active';
      identity: IdentityResponse;
      uid: string;
    };

export type DeliveryStatus = 'idle' | 'sending' | 'sent' | 'failed';

type AuthContextValue = {
  session: Session;
  verificationDelivery: DeliveryStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerification: () => Promise<void>;
  checkVerification: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  getAccountDetails: (signal: AbortSignal) => Promise<AccountDetailsResponse>;
  getUserProfile: (signal: AbortSignal) => Promise<UserProfileResponse>;
  updateUserProfile: (
    patch: UpdateUserProfileRequest,
  ) => Promise<UserProfileResponse>;
  clearUserProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth requires AuthProvider.');
  return auth;
};
