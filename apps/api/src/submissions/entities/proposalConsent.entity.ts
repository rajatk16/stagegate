import { Timestamp } from 'firebase-admin/firestore';

export class ProposalConsent {
  version: string;
  contentHash: string;
  acceptedAt: Timestamp;
  acceptedByUserId: string;
}
