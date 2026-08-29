export class ConfigurationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ConfigurationValidationError.name;
  }
}
