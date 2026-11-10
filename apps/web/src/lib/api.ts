import axios, { type AxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  allowAbsoluteUrls: false,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
});

export const apiRequest = async <T>(
  config: AxiosRequestConfig,
  schema: { parse(input: unknown): T },
): Promise<T> => {
  const response = await api.request<unknown>(config);
  return schema.parse(response.data);
};
