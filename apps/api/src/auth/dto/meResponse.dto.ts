import { ApiProperty } from '@nestjs/swagger';
import { Timestamp } from 'firebase-admin/firestore';

import { UserStatus } from '@/users/enums';

export class MeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({
    nullable: true,
  })
  photoUrl?: string | null;

  @ApiProperty()
  status: UserStatus;

  @ApiProperty()
  createdAt: Timestamp;

  @ApiProperty({
    type: [String],
  })
  organizations: string[];
}
