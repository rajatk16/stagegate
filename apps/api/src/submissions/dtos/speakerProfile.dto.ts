export class SpeakerProfileDto {
  id: string;
  displayName: string;
  biography: string | null;
  organization: string | null;
  jobTitle: string | null;
  location: string | null;
  websiteUrl: string | null;
  pronouns: string | null;
  createdAt: string;
  updatedAt: string;
}
