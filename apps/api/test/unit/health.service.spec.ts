import { HealthService } from '../../src/health/services/health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(() => {
    service = new HealthService();
  });

  it('reports liveness', () => {
    expect(service.getLiveness().status).toBe('ok');
  });

  it('starts as not ready', () => {
    expect(service.isReady()).toBe(false);

    expect(service.getReadiness().status).toBe('unavailable');
  });

  it('becomes ready after bootstrap', () => {
    service.onApplicationBootstrap();

    expect(service.isReady()).toBe(true);

    expect(service.getReadiness().status).toBe('ok');
  });

  it('becomes unavailable before shutdown', () => {
    service.onApplicationBootstrap();

    service.beforeApplicationShutdown();

    expect(service.isReady()).toBe(false);
  });

  it('keeps liveness independent of readiness', () => {
    service.markNotReady();

    expect(service.getLiveness().status).toBe('ok');

    expect(service.getReadiness().status).toBe('unavailable');
  });

  it('returns an ISO timestamp', () => {
    const { timestamp } = service.getLiveness();

    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });
});
