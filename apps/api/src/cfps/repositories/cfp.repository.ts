import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { Cfp } from '../entities';
import { cfpConverter } from '../converters';
import { CFP_COLLECTION } from '../constants';

@Injectable()
export class CfpRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(CFP_COLLECTION)
      .withConverter(cfpConverter);
  }

  getDocumentReference(eventId: string) {
    return this.collection().doc(eventId);
  }

  async findByEventId(eventId: string): Promise<Cfp | null> {
    const snapshot = await this.getDocumentReference(eventId).get();
    return snapshot.exists ? snapshot.data()! : null;
  }

  async create(cfp: Cfp): Promise<void> {
    await this.getDocumentReference(cfp.id).create(cfp);
  }

  async save(cfp: Cfp): Promise<void> {
    await this.getDocumentReference(cfp.id).set(cfp);
  }
}
