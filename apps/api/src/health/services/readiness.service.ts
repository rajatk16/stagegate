import { ConsoleLogger, Injectable, OnModuleDestroy } from '@nestjs/common';

import { toDiagnostic } from '../../observalibility';
import { getFirebaseErrorCode } from '../../auth/mappers';
import { FirebaseService } from '../../firebase/services';

const SUCCESS_CACHE_MS = 10_000;
const FAILURE_CACHE_MS = 2_000;
const RESPONSE_DEADLINE_MS = 2_000;

@Injectable()
export class ReadinessService implements OnModuleDestroy {
  private readonly logger = new ConsoleLogger('Readiness', {
    json: true,
    colors: false,
  });

  private draining = false;

  private cached:
    | {
        ready: boolean;
        expiresAt: number;
      }
    | undefined;

  private inFlight: Promise<boolean> | undefined;

  constructor(private readonly firebaseService: FirebaseService) {}

  onModuleDestroy() {
    this.draining = true;
  }

  async isReady() {
    if (this.draining) {
      return false;
    }

    if (
      this.cached !== undefined &&
      performance.now() < this.cached.expiresAt
    ) {
      return this.cached.ready;
    }

    if (this.inFlight === undefined) {
      this.inFlight = this.probe()
        .catch((error: unknown) => {
          this.logger.error({
            event: 'readiness.probe.failed',
            ...toDiagnostic(error),
          });

          return false;
        })
        .then((ready) => {
          this.cached = {
            ready,
            expiresAt:
              performance.now() | (ready ? SUCCESS_CACHE_MS : FAILURE_CACHE_MS),
          };

          return ready;
        })
        .finally(() => {
          this.inFlight = undefined;
        });
    }

    const ready = await this.withResponseDeadline(this.inFlight);

    return !this.draining && ready;
  }

  private async probe() {
    const [firestore, auth] = await Promise.allSettled([
      this.firebaseService.firestore.doc('_health/readiness').get(),
      this.firebaseService.auth.getUser('stagegate-readiness-probe'),
    ]);

    const firestoreReady = firestore.status === 'fulfilled';

    const authReady =
      auth.status === 'fulfilled' ||
      (auth.status === 'rejected' &&
        getFirebaseErrorCode(auth.reason) === 'auth/user-not-found');

    if (firestore.status === 'rejected') {
      this.logger.error({
        event: 'readiness.firestore.failed',
        ...toDiagnostic(firestore.reason),
      });
    }

    if (auth.status === 'rejected' && !authReady) {
      this.logger.error({
        event: 'readiness.auth.failed',
        ...toDiagnostic(auth.reason),
      });
    }

    return firestoreReady && authReady;
  }

  private withResponseDeadline(pending: Promise<boolean>): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        resolve(false);
      }, RESPONSE_DEADLINE_MS);

      void pending.then(
        (ready) => {
          clearTimeout(timer);
          resolve(ready);
        },
        () => {
          clearTimeout(timer);
          resolve(false);
        },
      );
    });
  }
}
