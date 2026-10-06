import { EmailReceipt } from '../../email';
import { InvitationCreationResult } from './invitationCreationResult.type';

export interface InvitationIssueResult extends InvitationCreationResult {
  emailStatus: EmailReceipt['status'];
}
