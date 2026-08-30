import { describe, it, expect } from '@jest/globals';
import { WorkerController } from './worker.controller';

describe('WorkerController', () => {
  it('returns the worker identity', () => {
    const controller = new WorkerController();

    expect(controller.getRoot()).toEqual({
      service: 'stagegate-worker',
      status: 'running',
    });
  });
});
