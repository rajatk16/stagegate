import { DiagnosticErrorCode } from '../types';

export class DiagnosticError extends Error {
  constructor(
    readonly diagnosticCode: DiagnosticErrorCode,
    readonly fields: readonly string[] = [],
  ) {
    super(diagnosticCode);
    this.name = 'DiagnosticError';
  }
}
