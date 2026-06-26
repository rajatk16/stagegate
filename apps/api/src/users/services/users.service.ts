import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email.toLowerCase());
  }

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async findByIds(ids: string[]) {
    return this.userRepository.findByIds(ids);
  }
}
