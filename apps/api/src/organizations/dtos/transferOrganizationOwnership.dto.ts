import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferOrganizationOwnershipDto {
  @ApiProperty({
    description: 'UserID of the new organization owner.',
  })
  @IsUUID()
  userId: string;
}
