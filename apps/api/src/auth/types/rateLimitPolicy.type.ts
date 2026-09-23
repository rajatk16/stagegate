export interface RateLimitPolicy {
  limit: number;
  ttl: number;
  blockDuration: number;
}
