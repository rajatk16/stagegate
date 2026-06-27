import type { QueryClient } from '@tanstack/react-query';
import { firebaseAuthService } from './firebaseAuth';
import { apiClient } from '@/api';

export class AuthSessionService {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  async signOut(): Promise<void> {
    await firebaseAuthService.signOut();

    delete apiClient.defaults.headers.common.Authorization;

    this.queryClient.clear();
  }
}
