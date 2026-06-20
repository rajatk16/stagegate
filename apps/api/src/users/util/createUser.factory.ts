import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';

import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/createUser.dto';

export const createUserFactory = (dto: CreateUserDto): User => {
  const now = Timestamp.now();

  return {
    id: randomUUID(),
    firebaseUid: dto.firebaseUid,
    email: dto.email.toLowerCase(),
    displayName: dto.displayName,
    photoUrl: dto.photoUrl ?? null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
};
