import { expect, test } from '@playwright/test';

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

test('supports keyboard access to the skip link', async ({ browserName, page }) => {
  await page.goto('/');

  const skipLink = page.getByRole('link', {
    name: 'Skip to content',
  });

  if (browserName === 'webkit') {
    // WebKit follows platform tab-focus defaults for links, so focus directly before testing activation.
    await skipLink.focus();
  } else {
    await page.keyboard.press('Tab');
  }

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
