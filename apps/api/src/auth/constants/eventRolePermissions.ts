import { EventPermission, EventRole } from '../enums';

export const EVENT_ROLE_PERMISSIONS: Record<EventRole, EventPermission[]> = {
  [EventRole.PROGRAM_CHAIR]: [
    EventPermission.EVENT_READ,
    EventPermission.CFP_MANAGE,
    EventPermission.EVENT_UPDATE,
    EventPermission.EVENT_ARCHIVE,
    EventPermission.EVENT_PUBLISH,
    EventPermission.EVENT_MEMBER_READ,
    EventPermission.EVENT_MEMBER_MANAGE,
    EventPermission.RUBRIC_MANAGE,
    EventPermission.REVIEW_PERIOD_MANAGE,
    EventPermission.REVIEW_ASSIGN,
    EventPermission.REVIEW_READ_ALL,
    EventPermission.CONFLICT_MANAGE,
    EventPermission.REVIEW_SCORECARD_READ,
    EventPermission.REVIEW_COVERAGE_READ,
    EventPermission.PROPOSAL_IDENTITY_READ,
    EventPermission.DECISION_ROUND_MANAGE,
    EventPermission.PROPOSAL_DECISION_MANAGE,
    EventPermission.DECISION_READ,
  ],
  [EventRole.REVIEWER]: [
    EventPermission.EVENT_READ,
    EventPermission.REVIEW_SUBMIT,
    EventPermission.REVIEWER_QUEUE_READ,
    EventPermission.CONFLICT_DECLARE,
  ],
};
