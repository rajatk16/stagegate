import { DiagnosticErrorCode } from '../types/diagnosticErrorCode.type';

export class DiagnosticError extends Error {
  constructor(
    readonly diagnosticCode: DiagnosticErrorCode,
    readonly fields: readonly string[] = [],
  ) {
    super(diagnosticCode);
    this.name = 'DiagnosticError';
  }
}
