import { HOUR, MINUTE } from '../constants';

export const sensitiveActionPolicies = {
  createOrganization: {
    ip: {
      limit: 30,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
    user: {
      limit: 3,
      ttl: HOUR,
      blockDuration: HOUR,
    },
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
  inviteOrganizationMember: {
    ip: {
      limit: 30,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
    user: {
      limit: 20,
      ttl: HOUR,
      blockDuration: HOUR,
    },
  },
  transferOrganizationOwnership: {
    ip: {
      limit: 20,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
    user: {
      limit: 5,
      ttl: HOUR,
      blockDuration: HOUR,
    },
  },
  createEvent: {
    ip: {
      limit: 30,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
    user: {
      limit: 20,
      ttl: HOUR,
      blockDuration: HOUR,
    },
  },
  updateEvent: {
    ip: {
      limit: 30,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
    user: {
      limit: 20,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
  },
  updateEventStatus: {
    ip: {
      limit: 30,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
    user: {
      limit: 10,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
  },
  inviteEventMember: {
    ip: {
      limit: 30,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
    user: {
      limit: 20,
      ttl: HOUR,
      blockDuration: HOUR,
    },
  },
  manageEventMembers: {
    ip: {
      limit: 30,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
    user: {
      limit: 20,
      ttl: MINUTE,
      blockDuration: MINUTE,
    },
  },
};

export type SensitiveActionName = keyof typeof sensitiveActionPolicies;
