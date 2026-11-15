import { jest } from '@jest/globals';
import { applicationDefault, deleteApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import { FIREBASE_APP_NAME } from '../constants/firebase.constants';

import { FirebaseService } from './firebase.service';

import type { FirebaseConfig, FirebaseRunTimeConfig } from '../config/firebase.config';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

jest.mock('firebase-admin/app', () => ({
  applicationDefault: jest.fn(),
  initializeApp: jest.fn(),
  deleteApp: jest.fn(),
  getApps: jest.fn(),
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(),
}));

const emulatorConfig: FirebaseRunTimeConfig = {
  mode: 'emulator',

  projectId: 'demo-stagegate',

  firestoreHost: '127.0.0.1:8080',

  authHost: '127.0.0.1:9099',

  healthTimeoutMs: 2000,

  healthCacheTtlMs: 5000,
};

const cloudConfig: FirebaseRunTimeConfig = {
  mode: 'cloud',

  projectId: 'stagegate-production',

  healthTimeoutMs: 2000,

  healthCacheTtlMs: 5000,
};

const mockApp = {
  name: FIREBASE_APP_NAME,
} as App;

const firestoreSettings = jest.fn();

const mockFirestore = {
  settings: firestoreSettings,
} as unknown as Firestore;

const mockAuth = {} as Auth;

function createService(configuration: FirebaseRunTimeConfig = emulatorConfig): FirebaseService {
  const config = {
    value: configuration,
  } as FirebaseConfig;

  return new FirebaseService(config);
}

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(() => {
    process.env['FIRESTORE_EMULATOR_HOST'] = '127.0.0.1:8080';

    process.env['FIREBASE_AUTH_EMULATOR_HOST'] = '127.0.0.1:9099';

    jest.mocked(getApps).mockReturnValue([]);

    jest.mocked(initializeApp).mockReturnValue(mockApp);

    jest.mocked(getFirestore).mockReturnValue(mockFirestore);

    jest.mocked(getAuth).mockReturnValue(mockAuth);

    jest.mocked(deleteApp).mockResolvedValue(undefined);

    service = createService();
  });

  afterEach(async () => {
    await service.shutdown();

    jest.resetAllMocks();
  });

  it('initializes a named Firebase application', async () => {
    await service.initialize();

    expect(initializeApp).toHaveBeenCalledWith(
      {
        projectId: 'demo-stagegate',
      },

      FIREBASE_APP_NAME,
    );

    expect(service.isInitialized).toBe(true);
  });

  it('does not request explicit ADC in emulator mode', async () => {
    await service.initialize();

    expect(jest.mocked(applicationDefault)).not.toHaveBeenCalled();
  });

  it('initializes Firestore settings', async () => {
    await service.initialize();

    expect(firestoreSettings).toHaveBeenCalledWith({
      ignoreUndefinedProperties: false,
    });
  });

  it('exposes initialized SDK instances', async () => {
    await service.initialize();

    expect(service.app).toBe(mockApp);

    expect(service.firestore).toBe(mockFirestore);

    expect(service.auth).toBe(mockAuth);
  });

  it('rejects access before initialization', () => {
    expect(() => service.app).toThrow();

    expect(() => service.firestore).toThrow();

    expect(() => service.auth).toThrow();
  });

  it('does not initialize twice', async () => {
    await service.initialize();

    await service.initialize();

    expect(initializeApp).toHaveBeenCalledTimes(1);
  });

  it('rejects an existing named application', async () => {
    jest.mocked(getApps).mockReturnValue([mockApp]);

    await expect(service.initialize()).rejects.toThrow('already exists');

    expect(initializeApp).not.toHaveBeenCalled();
  });

  it('rejects a mismatched emulator environment', async () => {
    process.env['FIRESTORE_EMULATOR_HOST'] = '127.0.0.1:9999';

    await expect(service.initialize()).rejects.toThrow('does not match validated configuration');

    expect(initializeApp).not.toHaveBeenCalled();
  });

  it('rejects emulator variables in cloud mode', async () => {
    service = createService(cloudConfig);

    await expect(service.initialize()).rejects.toThrow('forbidden in cloud mode');
  });

  it('uses ADC in cloud mode', async () => {
    delete process.env['FIRESTORE_EMULATOR_HOST'];

    delete process.env['FIREBASE_AUTH_EMULATOR_HOST'];

    service = createService(cloudConfig);

    await service.initialize();

    expect(jest.mocked(applicationDefault)).toHaveBeenCalledTimes(1);
  });

  it('cleans up after partial initialization failure', async () => {
    jest.mocked(getAuth).mockImplementation(() => {
      throw new Error('Auth initialization failed.');
    });

    await expect(service.initialize()).rejects.toThrow('Auth initialization failed');

    expect(deleteApp).toHaveBeenCalledWith(mockApp);

    expect(service.isInitialized).toBe(false);
  });

  it('disposes the application on shutdown', async () => {
    await service.initialize();

    await service.onApplicationShutdown();

    expect(deleteApp).toHaveBeenCalledWith(mockApp);

    expect(service.isInitialized).toBe(false);
  });

  it('makes shutdown idempotent', async () => {
    await service.initialize();

    await Promise.all([service.shutdown(), service.shutdown()]);

    expect(deleteApp).toHaveBeenCalledTimes(1);
  });

  it('rejects initialization after shutdown', async () => {
    await service.shutdown();

    await expect(service.initialize()).rejects.toThrow('shutting down');
  });
});
