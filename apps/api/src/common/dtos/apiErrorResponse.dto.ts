export class ApiErrorResponseDto {
  statusCode!: number;
  error!: string;
  code!: string;
  message!: string[];
  path!: string;
  timestamp!: string;
}
