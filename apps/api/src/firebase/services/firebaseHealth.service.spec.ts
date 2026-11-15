import { jest } from '@jest/globals';

import { FirebaseHealthService } from './firebaseHealth.service';

import type { FirebaseService } from './firebase.service';
import type { FirebaseConfig, FirebaseRunTimeConfig } from '../config/firebase.config';

const configuration: FirebaseRunTimeConfig = {
  mode: 'emulator',

  projectId: 'demo-stagegate',

  firestoreHost: '127.0.0.1:8080',

  authHost: '127.0.0.1:9099',

  healthTimeoutMs: 100,

  healthCacheTtlMs: 1000,
};

describe('FirebaseHealthService', () => {
  const firestoreGet = jest.fn<() => Promise<void>>();

  const authListUsers = jest.fn<(maxResults: number) => Promise<void>>();

  const firestoreDoc = jest.fn(() => ({
    get: firestoreGet,
  }));

  let initialized: boolean;

  let service: FirebaseHealthService;

  beforeEach(() => {
    jest.useFakeTimers();

    initialized = true;

    firestoreGet.mockResolvedValue(undefined);

    authListUsers.mockResolvedValue(undefined);

    const firebase = {
      get isInitialized() {
        return initialized;
      },

      firestore: {
        doc: firestoreDoc,
      },

      auth: {
        listUsers: authListUsers,
      },
    } as unknown as FirebaseService;

    const config = {
      value: configuration,
    } as FirebaseConfig;

    service = new FirebaseHealthService(firebase, config);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();

    firestoreDoc.mockImplementation(() => ({
      get: firestoreGet,
    }));
  });

  it('reports healthy dependencies', async () => {
    const result = await service.check();

    expect(result).toMatchObject({
      firestore: 'up',
      auth: 'up',
      healthy: true,
    });

    expect(firestoreDoc).toHaveBeenCalledWith('_system/health');

    expect(authListUsers).toHaveBeenCalledWith(1);
  });

  it('reports uninitialized Firebase as unhealthy', async () => {
    initialized = false;

    const result = await service.check();

    expect(result.healthy).toBe(false);

    expect(firestoreGet).not.toHaveBeenCalled();

    expect(authListUsers).not.toHaveBeenCalled();
  });

  it('reports Firestore failure', async () => {
    firestoreGet.mockRejectedValue(new Error('Firestore unavailable'));

    const result = await service.check();

    expect(result).toMatchObject({
      firestore: 'down',
      auth: 'up',
      healthy: false,
    });
  });

  it('reports Firebase Auth failure', async () => {
    authListUsers.mockRejectedValue(new Error('Auth unavailable'));

    const result = await service.check();

    expect(result).toMatchObject({
      firestore: 'up',
      auth: 'down',
      healthy: false,
    });
  });

  it('caches dependency results', async () => {
    await service.check();

    await service.check();

    expect(firestoreGet).toHaveBeenCalledTimes(1);

    expect(authListUsers).toHaveBeenCalledTimes(1);
  });

  it('refreshes expired results', async () => {
    await service.check();

    jest.advanceTimersByTime(1001);

    await service.check();

    expect(firestoreGet).toHaveBeenCalledTimes(2);
  });

  it('deduplicates concurrent checks', async () => {
    await Promise.all([service.check(), service.check(), service.check()]);

    expect(firestoreGet).toHaveBeenCalledTimes(1);

    expect(authListUsers).toHaveBeenCalledTimes(1);
  });

  it('reports a dependency timeout', async () => {
    firestoreGet.mockImplementation(() => new Promise<void>(() => undefined));

    const resultPromise = service.check();

    await jest.advanceTimersByTimeAsync(101);

    const result = await resultPromise;

    expect(result).toMatchObject({
      firestore: 'down',
      auth: 'up',
      healthy: false,
    });
  });

  it('does not duplicate timed-out operations', async () => {
    firestoreGet.mockImplementation(() => new Promise<void>(() => undefined));

    const first = service.check();

    await jest.advanceTimersByTimeAsync(101);

    await first;

    jest.advanceTimersByTime(1001);

    const second = service.check();

    await jest.advanceTimersByTimeAsync(101);

    await second;

    expect(firestoreGet).toHaveBeenCalledTimes(1);
  });

  it('does not return cached success after shutdown', async () => {
    await service.check();

    initialized = false;

    const result = await service.check();

    expect(result.healthy).toBe(false);
  });
});
