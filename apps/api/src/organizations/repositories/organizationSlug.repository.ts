import { Injectable } from '@nestjs/common';
import { Transaction } from 'firebase-admin/firestore';

import { FirebaseService } from '../../firebase/services/firebase.service';
import { slugReservationConverter } from '../converters/slugReservation.converter';

@Injectable()
export class OrganizationSlugRepository {
  constructor(private readonly firebase: FirebaseService) {}

  private collection() {
    return this.firebase.firestore
      .collection('orgSlugs')
      .withConverter(slugReservationConverter);
  }

  slugRef(slug: string) {
    return this.collection().doc(slug);
  }

  async isSlugReserved(transaction: Transaction, slug: string) {
    return (await transaction.get(this.slugRef(slug))).exists;
  }
}
