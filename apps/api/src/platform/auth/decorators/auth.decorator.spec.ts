import 'reflect-metadata';
import type { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from '@jest/globals';

import type { AuthenticatedRequest, AuthenticatedUser } from '../types';
import type { AuthenticationError } from '../utils';
import {
  CurrentActor,
  Public,
  PUBLIC_ROUTE_KEY,
  RequireVerifiedEmail,
  VERIFIED_EMAIL_REQUIRED_KEY,
} from './auth.decorator';

class TestController {
  handler(): void {
    return undefined;
  }
}

type CustomRouteArgMetadata = Record<
  string,
  {
    factory: (data: unknown, context: ExecutionContext) => AuthenticatedUser;
  }
>;

function createContext(actor?: AuthenticatedUser): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () =>
        ({
          actor,
        }) as AuthenticatedRequest,
    }),
  } as unknown as ExecutionContext;
}

function currentActorFactory(): CustomRouteArgMetadata[string]['factory'] {
  CurrentActor()(TestController.prototype, 'handler', 0);

  const metadata = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestController,
    'handler',
  ) as CustomRouteArgMetadata;

  const routeArgMetadata = Object.values(metadata)[0];

  if (routeArgMetadata === undefined) {
    throw new Error('CurrentActor route argument metadata was not registered.');
  }

  return routeArgMetadata.factory;
}

describe('auth decorators', () => {
  it('marks public routes with metadata', () => {
    class Controller {
      @Public()
      handler(): void {
        return undefined;
      }
    }

    expect(Reflect.getMetadata(PUBLIC_ROUTE_KEY, Controller.prototype.handler)).toBe(true);
  });

  it('marks routes that require verified email', () => {
    class Controller {
      @RequireVerifiedEmail()
      handler(): void {
        return undefined;
      }
    }

    expect(Reflect.getMetadata(VERIFIED_EMAIL_REQUIRED_KEY, Controller.prototype.handler)).toBe(
      true,
    );
  });

  it('returns the authenticated actor from the request', () => {
    const actor: AuthenticatedUser = {
      uid: 'user-123',
      email: 'person@example.test',
      emailVerified: true,
      authTime: 1_700_000_000,
    };

    expect(currentActorFactory()(undefined, createContext(actor))).toBe(actor);
  });

  it('throws when no authenticated actor is attached', () => {
    expect(() => currentActorFactory()(undefined, createContext())).toThrow(
      expect.objectContaining({
        code: 'AUTH_REQUIRED',
      }) as unknown as AuthenticationError,
    );
  });
});
