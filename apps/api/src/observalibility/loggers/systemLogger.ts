import { ConsoleLogger } from '@nestjs/common';

import { toDiagnostic } from '../mappers';

export class SystemLogger extends ConsoleLogger {
  constructor() {
    super({
      json: true,
      colors: false,
    });
  }

  override error(message: unknown, ...optionalParams: unknown[]): void {
    const source =
      message instanceof Error
        ? message
        : (optionalParams.find((value) => value instanceof Error) ?? message);
    super.error({
      event: 'framework.error',
      ...toDiagnostic(source),
    });
  }

  override fatal(message: unknown, ...optionalParams: unknown[]): void {
    const source =
      message instanceof Error
        ? message
        : (optionalParams.find((value) => value instanceof Error) ?? message);
    super.fatal({
      event: 'framework.fatal',
      ...toDiagnostic(source),
    });
  }
}
