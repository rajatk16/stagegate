import { ZodError } from 'zod';
import { knownCodes } from '../constants';
import { SafeDiagnostic } from '../types';
import { DiagnosticError } from '../errors';

export const toDiagnostic = (error: unknown): SafeDiagnostic => {
  let current = error;

  for (let depth = 0; depth < 4; depth += 1) {
    if (current instanceof DiagnosticError) {
      return {
        diagnosticCode: current.diagnosticCode,
        ...(current.fields.length > 0 ? { fields: current.fields } : {}),
      };
    }

    if (current instanceof ZodError) {
      return {
        diagnosticCode: 'DATA_SCHEMA_INVALID',
      };
    }

    if (typeof current !== 'object' || current === null) {
      break;
    }

    const code = 'code' in current ? current.code : undefined;

    if (typeof code === 'string' || typeof code === 'number') {
      const diagnosticCode = knownCodes.get(code);

      if (diagnosticCode !== undefined) {
        return { diagnosticCode };
      }
    }

    if (current instanceof TypeError) {
      return {
        diagnosticCode: 'TYPE_ERROR',
      };
    }

    if (current instanceof RangeError) {
      return {
        diagnosticCode: 'RANGE_ERROR',
      };
    }

    if (current instanceof SyntaxError) {
      return { diagnosticCode: 'SYNTAX_ERROR' };
    }

    current = 'cause' in current ? current.cause : undefined;
  }

  return {
    diagnosticCode: 'UNCLASSIFIED_ERROR',
  };
};
