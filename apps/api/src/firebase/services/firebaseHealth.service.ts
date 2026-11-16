import { Injectable } from '@nestjs/common';

import { FirebaseConfig } from '../config/firebase.config';
import { FIREBASE_HEALTH_DOCUMENT } from '../constants/firebase.constants';

import { FirebaseService } from './firebase.service';

export type DependencyStatus = 'up' | 'down';

export interface FirebaseHealthResult {
  firestore: DependencyStatus;
  auth: DependencyStatus;
  healthy: boolean;
  checkedAt: number;
}

type Dependency = 'firestore' | 'auth';

@Injectable()
export class FirebaseHealthService {
  private cached: FirebaseHealthResult | undefined;

  private inFlight: Promise<FirebaseHealthResult> | undefined;

  private readonly operations = new Map<Dependency, Promise<DependencyStatus>>();

  constructor(
    private readonly firebase: FirebaseService,
    private readonly config: FirebaseConfig,
  ) {}

  async check(): Promise<FirebaseHealthResult> {
    if (!this.firebase.isInitialized) {
      return {
        firestore: 'down',
        auth: 'down',
        healthy: false,
        checkedAt: Date.now(),
      };
    }

    const ttl = this.config.value.healthCacheTtlMs;

    if (this.cached && Date.now() - this.cached.checkedAt < ttl) {
      return this.cached;
    }

    this.inFlight ??= this.performCheck().finally(() => {
      this.inFlight = undefined;
    });

    return this.inFlight;
  }

  private async performCheck(): Promise<FirebaseHealthResult> {
    const [firestore, auth] = await Promise.all([
      this.checkDependency('firestore', async () => {
        await this.firebase.firestore.doc(FIREBASE_HEALTH_DOCUMENT).get();
      }),
      this.checkDependency('auth', async () => {
        await this.firebase.auth.listUsers(1);
      }),
    ]);

    const result: FirebaseHealthResult = {
      firestore,
      auth,
      healthy: firestore === 'up' && auth === 'up',
      checkedAt: Date.now(),
    };

    this.cached = result;

    return result;
  }

  private checkDependency(
    dependency: Dependency,
    operation: () => Promise<void>,
  ): Promise<DependencyStatus> {
    let pending = this.operations.get(dependency);

    if (!pending) {
      pending = Promise.resolve()
        .then(operation)
        .then(
          (): DependencyStatus => 'up',
          (): DependencyStatus => 'down',
        )
        .finally(() => {
          this.operations.delete(dependency);
        });

      this.operations.set(dependency, pending);
    }

    return this.withTimeout(pending, this.config.value.healthTimeoutMs);
  }

  private async withTimeout(
    operation: Promise<DependencyStatus>,
    timeoutMs: number,
  ): Promise<DependencyStatus> {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const timeout = new Promise<DependencyStatus>((resolve) => {
      timer = setTimeout(() => {
        resolve('down');
      }, timeoutMs);
    });

    try {
      return await Promise.race([operation, timeout]);
    } finally {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    }
  }
}
