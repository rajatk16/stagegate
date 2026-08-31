export interface AuthenticatedUser {
  readonly uid: string;
  readonly email: string | null;
  readonly emailVerified: boolean;
  readonly authTime: number;
}
