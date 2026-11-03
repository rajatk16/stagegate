import { EmailReceipt } from '../../email/types/emailReceipt.type';
import { InvitationCreationResult } from './invitationCreationResult.type';

export interface InvitationIssueResult extends InvitationCreationResult {
  emailStatus: EmailReceipt['status'];
}
