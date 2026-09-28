import { ConsoleLogger, type INestApplication } from '@nestjs/common';

export function installGracefulShutdown(
  app: INestApplication,
  timeoutMs: number,
): void {
  const logger = new ConsoleLogger('Shutdown', {
    json: true,
    colors: false,
  });

  let stopping = false;

  const stop = (signal: 'SIGTERM' | 'SIGINT'): void => {
    if (stopping) {
      return;
    }

    stopping = true;

    logger.log({
      event: 'shutdown.started',
      signal,
      timeoutMs,
    });

    const deadline = setTimeout(() => {
      logger.error({
        event: 'shutdown.timeout',
        signal,
      });

      process.exit(1);
    }, timeoutMs);

    // The timer must not keep an otherwise finished process alive.
    // Leave it armed to detect handles that remain after app.close().
    deadline.unref();

    void app.close().then(
      () => {
        process.exitCode ??= 0;

        logger.log({
          event: 'shutdown.completed',
          signal,
          exitCode: process.exitCode,
        });
      },
      () => {
        logger.error({
          event: 'shutdown.failed',
          signal,
        });

        process.exit(1);
      },
    );
  };

  process.on('SIGTERM', () => stop('SIGTERM'));
  process.on('SIGINT', () => stop('SIGINT'));
}
