import { ReceivedInvitation } from './receivedInvitation';

export type ReceivedInvitationsPage = {
  items: ReceivedInvitation[];
  nextCursor: string | null;
};
