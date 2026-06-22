export interface FirebaseUserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthenticatedUser {
  userId: string;
  firebaseUid: string;
  email: string;
  displayName: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: string[];
}
