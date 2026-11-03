import { ValidationIssueCode } from '../types/validationIssueCode.type';

export class ValidationIssueDto {
  field!: string;
  code!: ValidationIssueCode;
}
