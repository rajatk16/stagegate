import { createContext } from 'react';
import type { User } from 'firebase/auth';

export type AuthUser = Readonly<
  Pick<User, 'uid' | 'email' | 'emailVerified' | 'displayName' | 'photoURL'>
>;

export type SessionEndReason = 'initial' | 'signed-out' | 'expired';

export type AuthState =
  | {
      readonly status: 'loading';
      readonly user: null;
    }
  | {
      readonly status: 'unauthenticated';
      readonly user: null;
      readonly reason: SessionEndReason;
    }
  | {
      readonly status: 'authenticated';
      readonly user: AuthUser;
    };

export const AuthContext = createContext<AuthState | undefined>(undefined);
