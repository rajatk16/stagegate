import request from 'supertest';
import { Test } from '@nestjs/testing';
import { randomUUID, createHash } from 'node:crypto';
import type { App as HttpApp } from 'supertest/types';
import type { INestApplication } from '@nestjs/common';
import type { Auth, UserRecord } from 'firebase-admin/auth';
import { Timestamp, type Firestore } from 'firebase-admin/firestore';
import { deleteApp, type App as FirebaseApp } from 'firebase-admin/app';
import {
  it,
  jest,
  expect,
  afterAll,
  describe,
  afterEach,
  beforeAll,
  beforeEach,
} from '@jest/globals';

import {
  FIREBASE_APP,
  FIREBASE_AUTH,
  FIRESTORE,
} from '@stagegate/backend-platform';

import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/configureApplication';
import {
  MembershipRole,
  MembershipStatus,
} from '../src/platform/tenancy/types';
import type { CreateInvitationResponse } from '../src/platform/invitations/types';

jest.setTimeout(45_000);

describe('Organization invitations', () => {
  let app: INestApplication<HttpApp>;
  let firestore: Firestore;
  let organizationId: string;
  let ownerId: string;
  let recipientId: string;
  let otherId: string;

  const verifyIdToken = jest.fn<Auth['verifyIdToken']>();
  const getUser = jest.fn<Auth['getUser']>();

  const api = () => request(app.getHttpServer());

  const emailFor = (uid: string): string => `${uid}@example.test`;

  const ownerMembership = () =>
    firestore.collection('memberships').doc(`${organizationId}_${ownerId}`);

  const recipientMembership = () =>
    firestore.collection('memberships').doc(`${organizationId}_${recipientId}`);

  const createRequest = (
    role: MembershipRole = MembershipRole.REVIEWER,
    token = 'owner',
  ) =>
    api()
      .post(`/api/v1/organizations/${organizationId}/invitations`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: emailFor(recipientId),
        role,
      });

  const acceptRequest = (
    invitation: CreateInvitationResponse,
    token = 'recipient',
  ) =>
    api()
      .post('/api/v1/invitations/accept')
      .set('Authorization', `Bearer ${token}`)
      .send({ token: invitation.token });

  const createInvitation = async (
    role: MembershipRole = MembershipRole.REVIEWER,
  ): Promise<CreateInvitationResponse> => {
    const response = await createRequest(role).expect(201);
    return response.body as CreateInvitationResponse;
  };

  beforeAll(async () => {
    expect(process.env['APP_ENV']).toBe('test');
    expect(process.env['FIREBASE_PROJECT_ID']).toBe('stagegate-test');
    expect(process.env['FIRESTORE_EMULATOR_HOST']).toBe('127.0.0.1:8080');

    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FIREBASE_AUTH)
      .useValue({ verifyIdToken, getUser })
      .compile();

    app = module.createNestApplication();
    configureApplication(app);
    await app.init();

    firestore = app.get<Firestore>(FIRESTORE);
  });

  beforeEach(async () => {
    ownerId = `invite-owner-${randomUUID()}`;
    recipientId = `invite-recipient-${randomUUID()}`;
    otherId = `invite-other-${randomUUID()}`;

    organizationId = firestore.collection('organizations').doc().id;

    verifyIdToken.mockReset();
    getUser.mockReset();

    verifyIdToken.mockImplementation((token) => {
      const uid =
        token === 'owner'
          ? ownerId
          : token === 'recipient' || token === 'unverified'
            ? recipientId
            : token === 'other'
              ? otherId
              : undefined;

      if (uid === undefined) {
        return Promise.reject({ code: 'auth/invalid-id-token' });
      }

      const now = Math.floor(Date.now() / 1_000);

      return Promise.resolve({
        uid,
        sub: uid,
        aud: 'stagegate-test',
        iss: 'https://securetoken.google.com/stagegate-test',
        auth_time: now,
        iat: now,
        exp: now + 3_600,
        email: emailFor(uid),
        email_verified: token !== 'unverified',
        firebase: {
          identities: {},
          sign_in_provider: 'password',
        },
      });
    });

    getUser.mockImplementation((uid) =>
      Promise.resolve({
        uid,
        email: emailFor(uid),
        emailVerified: true,
        disabled: false,
      } as UserRecord),
    );

    const now = Timestamp.now();
    const batch = firestore.batch();

    batch.create(firestore.collection('organizations').doc(organizationId), {
      organizationId,
      name: 'Invitation Test Organization',
      version: 1,
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: ownerId,
      updatedBy: ownerId,
    });

    batch.create(ownerMembership(), {
      membershipId: `${organizationId}_${ownerId}`,
      organizationId,
      userId: ownerId,
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
      version: 1,
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: ownerId,
      updatedBy: ownerId,
    });

    for (const uid of [ownerId, recipientId, otherId]) {
      batch.create(firestore.collection('users').doc(uid), {
        userId: uid,
        displayName: null,
        bio: null,
        version: 1,
        schemaVersion: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: uid,
        updatedBy: uid,
      });
    }

    await batch.commit();
  });

  afterEach(async () => {
    // Remove only documents belonging to this test's organization/users.
    for (const collection of ['invitations', 'memberships', 'auditLogs']) {
      const snapshot = await firestore
        .collection(collection)
        .where('organizationId', '==', organizationId)
        .get();

      await Promise.all(snapshot.docs.map((document) => document.ref.delete()));
    }

    await Promise.all([
      firestore.collection('organizations').doc(organizationId).delete(),
      ...[ownerId, recipientId, otherId].map((uid) =>
        firestore.collection('users').doc(uid).delete(),
      ),
    ]);
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }

    await firestore.terminate();
    await deleteApp(app.get<FirebaseApp>(FIREBASE_APP));
    await app.close();
  });

  it('requires authentication and verified email', async () => {
    await api()
      .post(`/api/v1/organizations/${organizationId}/invitations`)
      .send({
        email: emailFor(recipientId),
        role: MembershipRole.REVIEWER,
      })
      .expect(401);

    await api()
      .post('/api/v1/invitations/accept')
      .send({ token: 'a'.repeat(64) })
      .expect(401);

    await createRequest(MembershipRole.REVIEWER, 'unverified').expect(403);

    await api()
      .post('/api/v1/invitations/accept')
      .set('Authorization', 'Bearer unverified')
      .send({ token: 'a'.repeat(64) })
      .expect(403);
  });

  it('stores only the token digest and sets a 72-hour expiration', async () => {
    const before = Date.now();
    const invitation = await createInvitation();
    const after = Date.now();

    expect(invitation.token).toMatch(/^[a-f0-9]{64}$/);

    expect(invitation.invitationId).toBe(
      createHash('sha256').update(invitation.token).digest('hex'),
    );

    const expiresAt = Date.parse(invitation.expiresAt);
    const lifetime = 72 * 60 * 60 * 1_000;

    expect(expiresAt).toBeGreaterThanOrEqual(before + lifetime);
    expect(expiresAt).toBeLessThanOrEqual(after + lifetime);

    const stored = await firestore
      .collection('invitations')
      .doc(invitation.invitationId)
      .get();

    expect(stored.get('status')).toBe('PENDING');
    expect(stored.data()).not.toHaveProperty('token');
    expect(JSON.stringify(stored.data())).not.toContain(invitation.token);
  });

  it('allows exactly one concurrent acceptance and one acceptance audit', async () => {
    const invitation = await createInvitation();

    const responses = await Promise.all(
      Array.from({ length: 4 }, () => acceptRequest(invitation)),
    );

    expect(responses.map((response) => response.status).sort()).toEqual([
      200, 410, 410, 410,
    ]);

    const membership = await recipientMembership().get();

    expect(membership.data()).toMatchObject({
      organizationId,
      userId: recipientId,
      role: MembershipRole.REVIEWER,
      status: MembershipStatus.ACTIVE,
      version: 1,
    });

    const stored = await firestore
      .collection('invitations')
      .doc(invitation.invitationId)
      .get();

    expect(stored.get('status')).toBe('ACCEPTED');
    expect(stored.get('acceptedBy')).toBe(recipientId);

    const audits = await firestore
      .collection('auditLogs')
      .where('organizationId', '==', organizationId)
      .get();

    expect(
      audits.docs.filter(
        (document) => document.get('action') === 'invitation.accepted',
      ),
    ).toHaveLength(1);
  });

  it('rejects an expired invitation without creating membership', async () => {
    const invitation = await createInvitation();

    await firestore
      .collection('invitations')
      .doc(invitation.invitationId)
      .update({
        expiresAt: Timestamp.fromMillis(Date.now() - 1),
      });

    await acceptRequest(invitation).expect(410);
    expect((await recipientMembership().get()).exists).toBe(false);
  });

  it('rejects the wrong recipient without consuming the invitation', async () => {
    const invitation = await createInvitation();

    await acceptRequest(invitation, 'other').expect(403);

    const stored = await firestore
      .collection('invitations')
      .doc(invitation.invitationId)
      .get();

    expect(stored.get('status')).toBe('PENDING');

    await acceptRequest(invitation).expect(200);
  });

  it('uses the current Firebase email rather than a stale token email', async () => {
    const invitation = await createInvitation();

    getUser.mockResolvedValue({
      uid: recipientId,
      email: 'changed@example.test',
      emailVerified: true,
      disabled: false,
    } as UserRecord);

    await acceptRequest(invitation).expect(403);
    expect((await recipientMembership().get()).exists).toBe(false);
  });

  it('rejects OWNER invitations and restricts ADMIN invitations to owners', async () => {
    await createRequest(MembershipRole.OWNER).expect(422);

    await ownerMembership().update({
      role: MembershipRole.ADMIN,
    });

    await createRequest(MembershipRole.ADMIN).expect(403);
    await createRequest(MembershipRole.REVIEWER).expect(201);
  });

  it('rejects invitation creation by a nonmember', async () => {
    await createRequest(MembershipRole.REVIEWER, 'other').expect(404);
  });

  it('rechecks the inviter role before accepting an ADMIN invitation', async () => {
    const invitation = await createInvitation(MembershipRole.ADMIN);

    await ownerMembership().update({
      role: MembershipRole.ADMIN,
    });

    await acceptRequest(invitation).expect(410);
    expect((await recipientMembership().get()).exists).toBe(false);
  });

  it('rejects invitations from a suspended inviter', async () => {
    const invitation = await createInvitation();

    await ownerMembership().update({
      status: MembershipStatus.SUSPENDED,
    });

    await acceptRequest(invitation).expect(410);
  });

  it.each([
    MembershipStatus.ACTIVE,
    MembershipStatus.SUSPENDED,
    MembershipStatus.REMOVED,
  ])('does not overwrite an existing %s membership', async (status) => {
    const invitation = await createInvitation(MembershipRole.ADMIN);
    const now = Timestamp.now();

    const original = {
      membershipId: `${organizationId}_${recipientId}`,
      organizationId,
      userId: recipientId,
      role: MembershipRole.OBSERVER,
      status,
      version: 4,
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: ownerId,
      updatedBy: ownerId,
    };

    await recipientMembership().create(original);

    await acceptRequest(invitation).expect(409);

    expect((await recipientMembership().get()).data()).toEqual(original);

    const stored = await firestore
      .collection('invitations')
      .doc(invitation.invitationId)
      .get();

    expect(stored.get('status')).toBe('PENDING');
  });

  it('requires a bootstrapped recipient profile', async () => {
    const invitation = await createInvitation();

    await firestore.collection('users').doc(recipientId).delete();

    await acceptRequest(invitation).expect(409);
    expect((await recipientMembership().get()).exists).toBe(false);
  });

  it('rejects client-selected organization and role during acceptance', async () => {
    const invitation = await createInvitation();

    await api()
      .post('/api/v1/invitations/accept')
      .set('Authorization', 'Bearer recipient')
      .send({
        token: invitation.token,
        organizationId,
        role: MembershipRole.OWNER,
      })
      .expect(422);

    expect((await recipientMembership().get()).exists).toBe(false);
  });

  it('rejects malformed and unknown tokens', async () => {
    await api()
      .post('/api/v1/invitations/accept')
      .set('Authorization', 'Bearer recipient')
      .send({ token: '../invalid' })
      .expect(422);

    await api()
      .post('/api/v1/invitations/accept')
      .set('Authorization', 'Bearer recipient')
      .send({ token: '0'.repeat(64) })
      .expect(410);
  });
});
