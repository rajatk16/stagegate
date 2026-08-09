import { SetMetadata } from '@nestjs/common';

export const REQUIRE_RECENT_AUTH_KEY = 'requireRecentAuthentication';

export const RequireRecentAuthentication = (maxAgeSeconds?: number) =>
  SetMetadata(REQUIRE_RECENT_AUTH_KEY, maxAgeSeconds ?? true);
