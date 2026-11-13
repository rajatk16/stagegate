import { AsyncLocalStorage } from 'async_hooks';

import { Injectable } from '@nestjs/common';

export interface RequestContext {
  readonly requestId: string;
  readonly startedAt: number;
}

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(Object.freeze({ ...context }), callback);
  }

  get(): RequestContext | undefined {
    return this.storage.getStore();
  }

  require(): RequestContext {
    const context = this.get();

    if (!context) {
      throw new Error('Request context is unavailable.');
    }

    return context;
  }

  getRequestId(): string | undefined {
    return this.get()?.requestId;
  }
}
