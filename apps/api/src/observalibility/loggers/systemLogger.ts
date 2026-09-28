import { ConsoleLogger } from "@nestjs/common";

export class SystemLogger extends ConsoleLogger {
  constructor() {
    super({
      json: true,
      colors: false,
    });
  }

  override error(
    _message: unknown,
    ..._optionalParams: unknown[]
  ): void {
    super.error({
      event: 'framework.error'
    });
  }

  override fatal(
    _message: unknown,
    ..._optionalParams: unknown[]
  ): void {
    super.fatal({
      event: 'framework.fatal'
    });
  }
}
