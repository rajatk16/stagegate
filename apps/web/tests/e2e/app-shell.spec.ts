import { expect, test, type Page, type TestInfo } from '@playwright/test';

const authEmulatorOrigin = 'http://127.0.0.1:9099';
const authEmulatorProjectId = 'demo-stagegate-local';
const authEmulatorApiKey = 'demo-api-key';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const readErrorMessage = (body: unknown): string => {
  if (isRecord(body) && isRecord(body['error']) && typeof body['error']['message'] === 'string') {
    return body['error']['message'];
  }

  return 'unknown error';
};

const readString = (body: unknown, key: string): string => {
  if (isRecord(body) && typeof body[key] === 'string') {
    return body[key];
  }

  throw new Error(`Auth emulator response did not include ${key}.`);
};

const postAuthEmulator = async (endpoint: string, payload: Record<string, unknown>) => {
  const response = await fetch(
    `${authEmulatorOrigin}/identitytoolkit.googleapis.com/v1/${endpoint}?key=${authEmulatorApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
  const body: unknown = await response.json();

  if (!response.ok) {
    throw new Error(`Auth emulator ${endpoint} failed: ${readErrorMessage(body)}`);
  }

  return body;
};

const getAuthEmulator = async (endpoint: string) => {
  const response = await fetch(
    `${authEmulatorOrigin}/emulator/v1/projects/${authEmulatorProjectId}/${endpoint}`,
  );
  const body: unknown = await response.json();

  if (!response.ok) {
    throw new Error(`Auth emulator ${endpoint} failed: ${readErrorMessage(body)}`);
  }

  return body;
};

const readEmailVerificationCode = (body: unknown, email: string): string => {
  if (!isRecord(body) || !Array.isArray(body['oobCodes'])) {
    throw new Error('Auth emulator response did not include OOB codes.');
  }

  const candidates: readonly unknown[] = body['oobCodes'];
  const code = candidates.find(
    (candidate: unknown) =>
      isRecord(candidate) &&
      candidate['email'] === email &&
      candidate['requestType'] === 'VERIFY_EMAIL' &&
      typeof candidate['oobCode'] === 'string',
  );

  if (!isRecord(code) || typeof code['oobCode'] !== 'string') {
    throw new Error('Auth emulator response did not include a verification code.');
  }

  return code['oobCode'];
};

const createVerifiedUser = async (email: string, password: string) => {
  const signUpBody = await postAuthEmulator('accounts:signUp', {
    email,
    password,
    returnSecureToken: true,
  });

  await postAuthEmulator('accounts:sendOobCode', {
    requestType: 'VERIFY_EMAIL',
    idToken: readString(signUpBody, 'idToken'),
  });

  const oobCodes = await getAuthEmulator('oobCodes');
  const verificationCode = readEmailVerificationCode(oobCodes, email);

  await postAuthEmulator('accounts:update', {
    oobCode: verificationCode,
  });
};

const signInVerifiedUser = async (page: Page, testInfo: TestInfo) => {
  const suffix = [
    testInfo.project.name,
    testInfo.workerIndex,
    Date.now().toString(36),
    Math.random().toString(36).slice(2),
  ]
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');
  const email = `app-shell-${suffix}@example.test`;
  const password = 'correct horse battery staple';

  await createVerifiedUser(email, password);

  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL('/');
};

test.beforeEach(async ({ page }, testInfo) => {
  await signInVerifiedUser(page, testInfo);
});

test('renders the application shell', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('link', {
      name: 'StageGate',
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Dashboard',
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('navigation', {
      name: 'Primary navigation',
    }),
  ).toBeVisible();
});

test('navigates between application pages', async ({ page }) => {
  await page.goto('/');

  const primaryNavigation = page.getByRole('navigation', {
    name: 'Primary navigation',
  });

  await primaryNavigation.getByRole('link', { name: 'Events' }).click();

  await expect(page).toHaveURL('/events');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Events',
    }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Settings' }).click();

  await expect(page).toHaveURL('/settings');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Settings',
    }),
  ).toBeVisible();
});

test('renders a useful not-found page', async ({ page }) => {
  await page.goto('/missing-page');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Page not found',
    }),
  ).toBeVisible();

  await page
    .getByRole('link', {
      name: 'Return to dashboard',
    })
    .click();

  await expect(page).toHaveURL('/');
});

test('supports keyboard access to the skip link', async ({ page }) => {
  await page.goto('/');

  const skipLink = page.getByRole('link', {
    name: 'Skip to content',
  });

  // Browser tab-focus defaults vary, so focus the link directly before testing keyboard activation.
  await skipLink.focus();

  await expect(skipLink).toBeFocused();

  await skipLink.press('Enter');

  await expect(page.locator('#main-content')).toBeFocused();
});

test('supports direct navigation and reloads on nested routes', async ({ page }) => {
  await page.goto('/settings');

  const heading = page.getByRole('heading', {
    level: 1,
    name: 'Settings',
  });

  await expect(heading).toBeVisible();

  await page.reload();

  await expect(page).toHaveURL('/settings');
  await expect(heading).toBeVisible();
});
