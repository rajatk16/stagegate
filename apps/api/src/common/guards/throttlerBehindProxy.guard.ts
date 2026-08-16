import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { RequestContext } from '@/auth';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async getTracker(
    request: Record<string, unknown>,
  ): Promise<string> {
    const requestContext = request.context as RequestContext | undefined;

    if (requestContext?.user?.userId) {
      return `user:${requestContext.user.userId}`;
    }

    const ips = request.ips as string[] | undefined;
    const ip = request.ip as string | undefined;

    return `ip:${ips?.[0] ?? ip ?? 'unknown'}`;
  }
}
