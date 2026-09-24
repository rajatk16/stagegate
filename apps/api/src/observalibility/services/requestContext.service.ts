import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "node:async_hooks";
import { RequestContext } from "../types";

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  get(): RequestContext | undefined {
    return this.storage.getStore();
  }

  require(): RequestContext {
    const context = this.get();

    if (!context) {
      throw new Error('Request context is unavailable');
    }

    return context;
  }

  setActor(uid: string): void {
    this.require().actorUid = uid;
  }
}
