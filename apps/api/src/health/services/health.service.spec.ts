import { jest } from '@jest/globals';

import { HealthService } from './health.service';

import type {
  FirebaseHealthResult,
  FirebaseHealthService,
} from '../../firebase/services/firebaseHealth.service';

describe('HealthService', () => {
  const check = jest.fn<() => Promise<FirebaseHealthResult>>();

  let service: HealthService;

  beforeEach(() => {
    check.mockResolvedValue({
      firestore: 'up',
      auth: 'up',
      healthy: true,
      checkedAt: Date.now(),
    });

    const firebaseHealth = {
      check,
    } as unknown as FirebaseHealthService;

    service = new HealthService(firebaseHealth);
  });

  it('reports liveness without dependency checks', () => {
    expect(service.getLiveness().status).toBe('ok');

    expect(check).not.toHaveBeenCalled();
  });

  it('starts as unavailable', async () => {
    expect(service.isReady()).toBe(false);

    expect((await service.getReadiness()).status).toBe('unavailable');

    expect(check).not.toHaveBeenCalled();
  });

  it('reports readiness when dependencies are healthy', async () => {
    service.onApplicationBootstrap();

    expect((await service.getReadiness()).status).toBe('ok');
  });

  it('reports unavailable dependencies', async () => {
    service.onApplicationBootstrap();

    check.mockResolvedValue({
      firestore: 'down',
      auth: 'up',
      healthy: false,
      checkedAt: Date.now(),
    });

    expect((await service.getReadiness()).status).toBe('unavailable');
  });

  it('handles unexpected health check errors', async () => {
    service.onApplicationBootstrap();

    check.mockRejectedValue(new Error('Unexpected failure'));

    expect((await service.getReadiness()).status).toBe('unavailable');
  });

  it('becomes unavailable during module destruction', async () => {
    service.onApplicationBootstrap();

    service.onModuleDestroy();

    expect((await service.getReadiness()).status).toBe('unavailable');
  });

  it('becomes unavailable before shutdown', async () => {
    service.onApplicationBootstrap();

    service.beforeApplicationShutdown();

    expect((await service.getReadiness()).status).toBe('unavailable');
  });

  it('keeps liveness independent of readiness', () => {
    service.markNotReady();

    expect(service.getLiveness().status).toBe('ok');
  });

  it('returns a valid ISO timestamp', () => {
    const { timestamp } = service.getLiveness();

    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });
});
