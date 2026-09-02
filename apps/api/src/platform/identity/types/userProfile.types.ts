export interface UserProfile {
  userId: string;
  displayName: string | null;
  bio: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
