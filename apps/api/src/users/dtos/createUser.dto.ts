import { IsEmail, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  firebaseUid: string;

  @IsEmail()
  email: string;

  @IsString()
  displayName: string;

  @IsUrl()
  @IsOptional()
  photoUrl?: string;
}
