import { ValidationIssueCode } from '../types';

export class ValidationIssueDto {
  field!: string;
  code!: ValidationIssueCode;
}
