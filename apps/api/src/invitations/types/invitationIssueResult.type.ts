import { EmailReceipt } from '../../email/types';
import { InvitationCreationResult } from './invitationCreationResult.type';

export interface InvitationIssueResult extends InvitationCreationResult {
  emailStatus: EmailReceipt['status'];
}
