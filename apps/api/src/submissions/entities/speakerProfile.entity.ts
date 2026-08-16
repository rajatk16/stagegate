import { Timestamp } from 'firebase-admin/firestore';

export class SpeakerProfile {
  id: string;
  eventId: string;
  userId: string;

  displayName: string;
  biography: string | null;
  organization: string | null;
  jobTitle: string | null;
  location: string | null;
  websiteUrl: string | null;
  pronouns: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
