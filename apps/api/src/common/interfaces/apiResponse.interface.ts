export interface ResponseMeta {
  requestId: string;
  timestamp: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

export interface ValidationErrorDetail {
  field: string;
  messages: string[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationErrorDetail[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  meta: ResponseMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
