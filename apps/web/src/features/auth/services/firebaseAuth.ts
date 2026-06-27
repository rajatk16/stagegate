import {
  signOut,
  type User,
  signInWithPopup,
  type Unsubscribe,
  GoogleAuthProvider,
  onAuthStateChanged,
  type UserCredential,
} from 'firebase/auth';

import { auth } from '@/firebase';

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

class FirebaseAuthService {
  async signInWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth, googleProvider);
  }

  async signOut(): Promise<void> {
    return signOut(auth);
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  async getIdToken(forceRefresh = false): Promise<string | null> {
    const user = auth.currentUser;

    if (!user) {
      return null;
    }

    return user.getIdToken(forceRefresh);
  }

  subscribe(callback: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, callback);
  }
}

export const firebaseAuthService = new FirebaseAuthService();
