import { Injectable } from '@nestjs/common';
import { FirebaseService } from '@/firebase';

import { Proposal } from '../entities';
import { PROPOSALS_COLLECTION } from '../constants';
import { proposalConverter } from '../converters';

@Injectable()
export class ProposalRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(PROPOSALS_COLLECTION)
      .withConverter(proposalConverter);
  }

  getDocumentReference(proposalId: string) {
    return this.collection().doc(proposalId);
  }

  async findById(proposalId: string): Promise<Proposal | null> {
    const snapshot = await this.getDocumentReference(proposalId).get();

    return snapshot.exists ? snapshot.data()! : null;
  }

  async findByEventAndOwner(
    eventId: string,
    ownerUserId: string,
  ): Promise<Proposal[]> {
    const snapshot = await this.collection()
      .where('eventId', '==', eventId)
      .where('ownerUserId', '==', ownerUserId)
      .orderBy('updatedAt', 'desc')
      .get();

    return snapshot.docs.map((document) => document.data());
  }

  getCountByEventAndOwner(eventId: string, ownerUserId: string) {
    return this.collection()
      .where('eventId', '==', eventId)
      .where('ownerUserId', '==', ownerUserId)
      .count();
  }
}
