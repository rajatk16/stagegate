import { useQueryClient } from '@tanstack/react-query';
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from 'react';
import {
  reload,
  type Auth,
  type User,
  updatePassword,
  EmailAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  reauthenticateWithCredential,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import {
  type Session,
  type DeliveryStatus,
  AuthContext,
} from '../context/auth';
import {
  deleteUserProfile,
  fetchAccountDetails,
  fetchUserProfile,
  identityFailureMessage,
  loadIdentity,
  patchUserProfile,
} from '../api/identity';

export const AuthProvider = ({
  auth,
  children,
}: PropsWithChildren<{ auth: Auth | null }>) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session>({
    status: auth ? 'loading' : 'unavailable',
  });
  const [delivery, setDelivery] = useState<{
    user: User;
    status: DeliveryStatus;
  }>();
  const sendingFor = useRef<User | undefined>(undefined);
  const observeUid = useRef<string | null | undefined>(undefined);
  const pendingIdentity = useRef<AbortController | undefined>(undefined);

  const resolve = useCallback(
    async (user: User, refresh: boolean): Promise<boolean> => {
      pendingIdentity.current?.abort();
      const controller = new AbortController();
      pendingIdentity.current = controller;
      const current = () =>
        !controller.signal.aborted && auth?.currentUser === user;

      try {
        if (refresh) await reload(user);
        if (!current()) return false;
        if (!user.emailVerified) {
          setSession({
            status: 'verify',
            email: user.email ?? '',
            uid: user.uid,
          });
          return false;
        }
        const identity = await loadIdentity(user, controller.signal, refresh);
        if (current())
          setSession({ status: 'active', identity, uid: user.uid });
        return current();
      } catch (error) {
        if (current())
          setSession({
            status: 'error',
            message: identityFailureMessage(error),
          });
        return false;
      }
    },
    [auth],
  );

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      pendingIdentity.current?.abort();
      const uid = user?.uid ?? null;
      if (observeUid.current !== undefined && observeUid.current !== uid) {
        queryClient.clear();
        setDelivery((previous) =>
          previous?.user === user ? previous : undefined,
        );
      }
      observeUid.current = uid;
      if (!user) {
        setSession({ status: 'signed-out' });
        return;
      }
      setSession({ status: 'loading' });
      void resolve(user, false);
    });
    return () => {
      unsubscribe();
      pendingIdentity.current?.abort();
    };
  }, [auth, queryClient, resolve]);

  const configuredAuth = (): Auth => {
    if (!auth) throw new Error('StageGate Auth is unavailable');
    return auth;
  };

  const activeUser = (): User => {
    const user = configuredAuth().currentUser;
    if (session.status !== 'active' || user?.uid !== session.uid) {
      throw new Error('The active account has changed.');
    }
    return user;
  };

  const deliverVerification = async (user: User): Promise<void> => {
    if (sendingFor.current === user || auth?.currentUser !== user) return;
    sendingFor.current = user;
    setDelivery({ user, status: 'sending' });
    try {
      await sendEmailVerification(user, {
        url: new URL('/verify-email', window.location.origin).href,
      });
      if (auth.currentUser === user) setDelivery({ user, status: 'sent' });
    } catch {
      if (auth.currentUser === user) setDelivery({ user, status: 'failed' });
    } finally {
      if (sendingFor.current === user) sendingFor.current = undefined;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        verificationDelivery:
          session.status === 'verify' && delivery?.user.uid === session.uid
            ? delivery.status
            : 'idle',
        signIn: async (email, password) => {
          await signInWithEmailAndPassword(configuredAuth(), email, password);
        },
        signUp: async (email, password) => {
          const { user } = await createUserWithEmailAndPassword(
            configuredAuth(),
            email,
            password,
          );
          await deliverVerification(user);
        },
        signOut: () => firebaseSignOut(configuredAuth()),
        sendVerification: async () => {
          const user = configuredAuth().currentUser;
          if (user) await deliverVerification(user);
        },
        checkVerification: async () => {
          const user = configuredAuth().currentUser;
          return user ? resolve(user, true) : false;
        },
        resetPassword: async (email) => {
          try {
            await sendPasswordResetEmail(configuredAuth(), email, {
              url: new URL('/sign-in', window.location.origin).href,
            });
          } catch (error) {
            if (
              !(error instanceof Error) ||
              !('code' in error) ||
              error.code !== 'auth/user-not-found'
            )
              throw error;
          }
        },
        changePassword: async (currentPassword, newPassword) => {
          const firebase = configuredAuth();
          const user = firebase.currentUser;
          if (
            session.status !== 'active' ||
            !user?.email ||
            session.uid !== user.uid
          ) {
            throw new Error('The active account has changed.');
          }

          const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword,
          );
          await reauthenticateWithCredential(user, credential);
          if (firebase.currentUser !== user) {
            throw new Error('The active account has changed.');
          }

          await updatePassword(user, newPassword);
        },
        getAccountDetails: (signal) =>
          fetchAccountDetails(activeUser(), signal),
        getUserProfile: (signal) => fetchUserProfile(activeUser(), signal),
        updateUserProfile: async (patch) => {
          const user = activeUser();
          const result = await patchUserProfile(user, patch);
          if (configuredAuth().currentUser !== user)
            throw new Error('The active account has changed.');

          return result;
        },
        clearUserProfile: async () => {
          const user = activeUser();
          await deleteUserProfile(user);
          if (configuredAuth().currentUser !== user)
            throw new Error('The active account has changed.');
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
