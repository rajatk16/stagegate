import { setTimeout as delay } from 'node:timers/promises';

import { RequestContextService } from '../../src/common/services/requestContext.service';

describe('RequestContextService', () => {
  let service: RequestContextService;

  beforeEach(() => {
    service = new RequestContextService();
  });

  it('returns undefined outside a request', () => {
    expect(service.get()).toBeUndefined();
  });

  it('throws when required context is missing', () => {
    expect(() => service.require()).toThrow('Request context is unavailable.');
  });

  it('provides context within a callback', () => {
    service.run(
      {
        requestId: 'request-a',
        startedAt: 100,
      },
      () => {
        expect(service.getRequestId()).toBe('request-a');

        expect(service.require().startedAt).toBe(100);
      },
    );
  });

  it('preserves context across asynchronous operations', async () => {
    await service.run(
      {
        requestId: 'request-a',
        startedAt: 100,
      },
      async () => {
        await delay(5);

        expect(service.getRequestId()).toBe('request-a');
      },
    );
  });

  it('isolates concurrent requests', async () => {
    const results = await Promise.all([
      service.run(
        {
          requestId: 'request-a',
          startedAt: 100,
        },
        async () => {
          await delay(20);
          return service.getRequestId();
        },
      ),

      service.run(
        {
          requestId: 'request-b',
          startedAt: 200,
        },
        async () => {
          await delay(5);
          return service.getRequestId();
        },
      ),
    ]);

    expect(results).toEqual(['request-a', 'request-b']);
  });

  it('restores the outer context after nested execution', () => {
    service.run(
      {
        requestId: 'outer',
        startedAt: 100,
      },
      () => {
        service.run(
          {
            requestId: 'inner',
            startedAt: 200,
          },
          () => {
            expect(service.getRequestId()).toBe('inner');
          },
        );

        expect(service.getRequestId()).toBe('outer');
      },
    );

    expect(service.get()).toBeUndefined();
  });

  it('freezes stored request context', () => {
    service.run(
      {
        requestId: 'request-a',
        startedAt: 100,
      },
      () => {
        expect(Object.isFrozen(service.require())).toBe(true);
      },
    );
  });
});
