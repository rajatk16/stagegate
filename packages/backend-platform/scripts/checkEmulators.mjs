import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { deleteApp, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const projectId = 'demo-stagegate-local';

// This script deliberately targets only the local emulators.
// Set these before initializing any Firebase service.
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';

const app = initializeApp(
  {
    projectId,
    storageBucket: `${projectId}.firebasestorage.app`,
  },
  `emulator-check-${randomUUID()}`,
);

const auth = getAuth(app);
const firestore = getFirestore(app);
const bucket = getStorage(app).bucket();

const id = randomUUID();
const uid = `smoke-${id}`;
const document = firestore.collection('_emulatorSmokeChecks').doc(id);
const file = bucket.file(`_emulatorSmokeChecks/${id}.txt`);

const cleanup = [];
let failed = false;

try {
  await auth.createUser({ uid });
  cleanup.push(() => auth.deleteUser(uid));

  const user = await auth.getUser(uid);
  assert.equal(user.uid, uid);
  console.log('PASS: Auth create/read');

  await document.create({ value: 'firestore-ok' });
  cleanup.push(() => document.delete());

  const snapshot = await document.get();
  assert.equal(snapshot.get('value'), 'firestore-ok');
  console.log('PASS: Firestore create/read');

  await file.save('storage-ok', {
    resumable: false,
    contentType: 'text/plain',
  });
  cleanup.push(() => file.delete());

  const [contents] = await file.download();
  assert.equal(contents.toString('utf8'), 'storage-ok');
  console.log('PASS: Storage upload/download');
} catch (error) {
  failed = true;
  console.error('FAIL: Firebase emulator connectivity check.', error);
} finally {
  const results = await Promise.allSettled(cleanup.map((remove) => remove()));

  for (const result of results) {
    if (result.status === 'rejected') {
      failed = true;
      console.error('FAIL: Temporary resource cleanup.', result.reason);
    }
  }

  try {
    await firestore.terminate();
  } catch (error) {
    failed = true;
    console.error('FAIL: Firestore shutdown.', error);
  }

  try {
    await deleteApp(app);
  } catch (error) {
    failed = true;
    console.error('FAIL: Firebase app shutdown.', error);
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log('PASS: All three emulators verified and temporary data removed.');
}
