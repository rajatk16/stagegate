import {
  signOut,
  deleteUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import { firebaseAuth } from './firebaseClient';
import { environment } from '../config/environment';

export async function runAuthEmulatorSmokeCheck() {
  if (
    !import.meta.env.DEV ||
    !environment.firebase.useAuthEmulator ||
    firebaseAuth.emulatorConfig === null ||
    firebaseAuth.app.options.projectId !== 'demo-stagegate-local'
  ) {
    throw new Error('This smoke check requires the local Auth Emulator.');
  }

  await firebaseAuth.authStateReady();

  if (firebaseAuth.currentUser !== null) {
    throw new Error('Sign out before running the smoke check.');
  }

  const email = `day11-${crypto.randomUUID()}@example.test`;
  const password = `Local-only-${crypto.randomUUID()}!`;

  const created = await createUserWithEmailAndPassword(firebaseAuth, email, password);

  let userToDelete = created.user;

  try {
    await signOut(firebaseAuth);

    const signedIn = await signInWithEmailAndPassword(firebaseAuth, email, password);

    userToDelete = signedIn.user;

    if (signedIn.user.uid !== created.user.uid) {
      throw new Error('The signed-in user does not match the created user.');
    }

    // Exercise token issuance without printing the token.
    await signedIn.user.getIdToken(true);

    return {
      success: true,
      projectId: firebaseAuth.app.options.projectId,
      emulatorUrl: environment.firebase.authEmulatorUrl,
    };
  } finally {
    await deleteUser(userToDelete);
  }
}
