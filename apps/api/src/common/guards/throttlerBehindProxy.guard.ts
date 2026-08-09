import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async getTracker(
    request: Record<string, unknown>,
  ): Promise<string> {
    const ips = request.ips as string[] | undefined;
    const ip = request.ip as string | undefined;

    return ips?.[0] ?? ip ?? 'unknown';
  }
}
