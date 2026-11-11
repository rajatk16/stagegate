import { Injectable } from '@nestjs/common';
import { Transaction } from 'firebase-admin/firestore';

import { identityEmailKey } from '../utils/identityEmail.util';
import { FirebaseService } from '../../firebase/services/firebase.service';
import { identityMappingConverter } from '../converters/identityMapping.converter';

@Injectable()
export class IdentityMappingsRepository {
  constructor(private readonly firebase: FirebaseService) {}

  private authUsersCollection() {
    return this.firebase.firestore
      .collection('authUsers')
      .withConverter(identityMappingConverter);
  }

  private userEmailsCollection() {
    return this.firebase.firestore
      .collection('userEmails')
      .withConverter(identityMappingConverter);
  }

  private uidRef(uid: string) {
    return this.authUsersCollection().doc(uid);
  }

  private emailRef(email: string) {
    return this.userEmailsCollection().doc(identityEmailKey(email));
  }

  async findByUid(
    transaction: Transaction,
    uid: string,
  ): Promise<string | undefined> {
    return (await transaction.get(this.uidRef(uid))).data()?.userId;
  }

  async findByEmail(
    transaction: Transaction,
    email: string,
  ): Promise<string | undefined> {
    return (await transaction.get(this.emailRef(email))).data()?.userId;
  }

  async findBindings(transaction: Transaction, uid: string, email: string) {
    const [uidMapping, emailMapping] = await transaction.getAll(
      this.uidRef(uid),
      this.emailRef(email),
    );
    return {
      uidUserId: uidMapping.data()?.userId,
      emailUserId: emailMapping.data()?.userId,
    };
  }

  createUidMapping(
    transaction: Transaction,
    uid: string,
    userId: string,
  ): void {
    transaction.create(this.uidRef(uid), { userId });
  }

  createEmailMapping(
    transaction: Transaction,
    email: string,
    userId: string,
  ): void {
    transaction.create(this.emailRef(email), { userId });
  }
}
