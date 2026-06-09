import { User } from '@/common/interfaces';

export class SyncResponseDto {
  user: User;
  organizations: any[];
  activeOrganizationId: string | null;
}
