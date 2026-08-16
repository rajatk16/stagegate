import { Injectable } from '@nestjs/common';

import { EventMembership } from '../entities';
import { EventMembershipRepository } from '../repositories';

@Injectable()
export class EventMembershipService {
  constructor(
    private readonly eventMembershipRepository: EventMembershipRepository,
  ) {}

  async findMembership(eventId: string, userId: string) {
    return this.eventMembershipRepository.findByEventAndUser(eventId, userId);
  }

  async findActiveMemberships(eventId: string) {
    return this.eventMembershipRepository.findActiveByEvent(eventId);
  }

  async findActiveMembership(eventId: string, userId: string) {
    return this.eventMembershipRepository.findActiveByEventAndUser(
      eventId,
      userId,
    );
  }

  async createMembership(membership: EventMembership) {
    return this.eventMembershipRepository.create(membership);
  }

  async saveMembership(membership: EventMembership) {
    return this.eventMembershipRepository.save(membership);
  }
}
