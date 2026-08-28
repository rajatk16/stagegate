import { DecisionRoundStatus } from '../enums';

export class DecisionRoundResponseDto {
  id: string;
  reviewPeriodId: string;
  name: string;
  status: DecisionRoundStatus;
  openedAt: string | null;
  lockedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
