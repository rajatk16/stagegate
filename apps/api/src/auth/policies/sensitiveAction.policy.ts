import { HOUR, MINUTE } from "../constants";

export const sensitiveActionPolicies = {
  createOrganization: {
    ip: {
      limit: 30,
      ttl: MINUTE,
      blockDuration: MINUTE
    },
    user: {
      limit: 3,
      ttl: HOUR,
      blockDuration: HOUR
    }
  },
  finalSubmission: {
    ip: {
      limit: 30,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
    user: {
      limit: 5,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
  },
}

export type SensitiveActionName = keyof typeof sensitiveActionPolicies;