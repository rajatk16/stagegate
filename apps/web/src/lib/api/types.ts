import type { AxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface RequestOptions extends Omit<AxiosRequestConfig, 'signal'> {
  signal?: AbortSignal;
  timeout?: number;
}
