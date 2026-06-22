import type { AuthenticatedUser } from '@/features/auth';

export interface BootstrapData {
  authenticatedUser: AuthenticatedUser;
}
