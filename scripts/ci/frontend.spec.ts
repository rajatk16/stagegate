import { expect, test } from '@playwright/test';

test('landing page renders without JavaScript errors', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /great events start with great ideas/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: /create account/i }).first(),
  ).toBeVisible();

  const fitsViewport = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );

  expect(fitsViewport).toBe(true);
  expect(errors).toEqual([]);
});

test('sign-in works when opened directly and refreshed', async ({ page }) => {
  await page.goto('/sign-in');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Welcome back' }),
  ).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole('heading', { level: 1, name: 'Welcome back' }),
  ).toBeVisible();
});

test('dashboard redirects signed-out visitors to sign-in', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fdashboard$/);

  await expect(
    page.getByRole('heading', { level: 1, name: 'Welcome back' }),
  ).toBeVisible();
});

test('nginx does not return the SPA for missing assets or API paths', async ({
  request,
}) => {
  for (const path of ['/assets/does-not-exist.js', '/api/v1/does-not-exist']) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
  }
});
