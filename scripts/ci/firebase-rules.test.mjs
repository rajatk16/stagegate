import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';

import {
  assertFails,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

let environment;

const projectId = 'demo-stagegate-ci';
const bucket = `gs://${projectId}.appspot.com`;

before(async () => {
  environment = await initializeTestEnvironment({
    projectId,

    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules: await readFile('firestore.rules', 'utf8'),
    },

    storage: {
      host: '127.0.0.1',
      port: 9199,
      rules: await readFile('storage.rules', 'utf8'),
    },
  });

  await environment.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc('ci/probe').set({
      message: 'Rules test fixture',
    });

    await context
      .storage(bucket)
      .ref('ci/probe.txt')
      .put(new Uint8Array([104, 101, 108, 108, 111]), {
        contentType: 'text/plain',
      });
  });
});

after(async () => {
  await environment?.cleanup();
});

for (const authenticated of [false, true]) {
  const identity = authenticated ? 'signed-in client' : 'anonymous client';

  test(`Firestore denies direct access for ${identity}`, async () => {
    const context = authenticated
      ? environment.authenticatedContext('ci-user')
      : environment.unauthenticatedContext();

    const database = context.firestore();
    const document = database.doc('ci/probe');

    await assertFails(document.get());
    await assertFails(database.collection('ci').get());
    await assertFails(document.set({ changed: true }));
    await assertFails(document.delete());
  });

  test(`Storage denies direct access for ${identity}`, async () => {
    const context = authenticated
      ? environment.authenticatedContext('ci-user')
      : environment.unauthenticatedContext();

    const storage = context.storage(bucket);
    const object = storage.ref('ci/probe.txt');

    await assertFails(object.getMetadata());
    await assertFails(storage.ref('ci').listAll());

    await assertFails(
      object.put(new Uint8Array([120]), { contentType: 'text/plain' }),
    );

    await assertFails(object.delete());
  });
}
