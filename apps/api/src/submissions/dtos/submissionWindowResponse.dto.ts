import { SubmissionWindowState } from '../enums/submissionWindowState.enum';

export class SubmissionWindowResponseDto {
  organizationId!: string;
  eventId!: string;
  serverTime!: string;
  submissionOpensAt!: string | null;
  submissionClosesAt!: string | null;
  state!: SubmissionWindowState;
  acceptingSubmissions!: boolean;
}
