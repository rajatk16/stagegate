import { RateLimitPolicy } from "./rateLimitPolicy.type";

export interface SensitiveActionPolicy {
  ip: RateLimitPolicy;
  user: RateLimitPolicy;
}
