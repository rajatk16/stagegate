import { Injectable } from "@nestjs/common";

import { UserProfile } from "../models";
import { userProfileConverter } from "../converters";
import { FirebaseService } from "../../firebase/services";

@Injectable()
export class UsersRepository {
  constructor(private readonly firebase: FirebaseService) {}

  private collection() {
    return this.firebase.firestore
      .collection('users')
      .withConverter(userProfileConverter);
  }

  private document(uid: string) {
    return this.collection().doc(uid);
  }

  async getOrCreate(candidate: UserProfile): Promise<UserProfile> {
    const reference = this.document(candidate.uid);

    return this.firebase.firestore.runTransaction(
      async (transaction): Promise<UserProfile> => {
        const snapshot = await transaction.get(reference);
        const existing = snapshot.data();

        if (existing !== undefined) {
          return existing;
        }

        transaction.create(reference, candidate);

        return candidate;
      }
    )
  }
}
