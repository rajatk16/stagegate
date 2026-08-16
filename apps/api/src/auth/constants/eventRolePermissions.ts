import { EventPermission, EventRole } from '../enums';

export const EVENT_ROLE_PERMISSIONS: Record<EventRole, EventPermission[]> = {
  [EventRole.PROGRAM_CHAIR]: [
    EventPermission.EVENT_READ,
    EventPermission.EVENT_UPDATE,
    EventPermission.EVENT_ARCHIVE,
    EventPermission.EVENT_PUBLISH,
    EventPermission.EVENT_MEMBER_READ,
    EventPermission.EVENT_MEMBER_MANAGE,

    EventPermission.CFP_MANAGE,

    EventPermission.REVIEW_ASSIGN,
  ],
  [EventRole.REVIEWER]: [
    EventPermission.EVENT_READ,

    EventPermission.REVIEW_SUBMIT,
  ],
};
