export interface AuthenticatedUser {
  userId: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
}
