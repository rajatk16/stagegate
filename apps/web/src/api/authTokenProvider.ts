import { type AuthTokenProvider } from '@stagegate/apiClient';

type TokenResolver = () => Promise<string | null>;

let resolver: TokenResolver | undefined;

export const registerAuthTokenResolver = (nextResolver: TokenResolver): (() => void) => {
  resolver = nextResolver;

  return () => {
    if (resolver === nextResolver) {
      resolver = undefined;
    }
  };
};

export const authTokenProvider: AuthTokenProvider = {
  async getToken(): Promise<string | null> {
    return resolver ? resolver() : null;
  },
};
