import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns the health payload', () => {
    expect(new AppController().health()).toEqual({ status: 'ok' });
  });
});
