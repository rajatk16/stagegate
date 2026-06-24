import { EventPermission, EventRole } from '../enums';

export const EVENT_ROLE_PERMISSIONS: Record<EventRole, EventPermission[]> = {
  [EventRole.PROGRAM_CHAIR]: [
    EventPermission.EVENT_CREATE,
    EventPermission.EVENT_UPDATE,
    EventPermission.EVENT_DELETE,
    EventPermission.CFP_MANAGE,
    EventPermission.REVIEW_ASSIGN,
  ],
  [EventRole.REVIEWER]: [EventPermission.REVIEW_SUBMIT],
  [EventRole.PARTICIPANT]: [
    EventPermission.PROPOSAL_SUBMIT,
    EventPermission.PROPOSAL_EDIT,
    EventPermission.PROPOSAL_WITHDRAW,
  ],
};
