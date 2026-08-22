import { Injectable } from '@nestjs/common';
import { FieldPath } from 'firebase-admin/firestore';

import { FirebaseService } from '@/firebase';

import { Proposal } from '../entities';
import { proposalConverter } from '../converters';
import { PROPOSALS_COLLECTION } from '../constants';

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

  async findByIds(proposalIds: string[]): Promise<Proposal[]> {
    const uniqueIds = [...new Set(proposalIds)];

    if (uniqueIds.length === 0) return [];

    const chunks: string[][] = [];

    for (let index = 0; index < uniqueIds.length; index += 30) {
      chunks.push(uniqueIds.slice(index, index + 30));
    }

    const snapshots = await Promise.all(
      chunks.map((ids) =>
        this.collection().where(FieldPath.documentId(), 'in', ids).get(),
      ),
    );

    return snapshots.flatMap((snapshot) =>
      snapshot.docs.map((document) => document.data()),
    );
  }
}
