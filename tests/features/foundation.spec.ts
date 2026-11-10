import test, { expect } from '@playwright/test';
import { apiRequest } from '../../apps/web/src/lib/api';
import { healthResponseSchema } from '@stagegate/contracts';

test('shows the StageGate shell and supports keyboard navigation', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'StageGate' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('returns home from an unknown browser route', async ({ page }) => {
  await page.goto('/unknown-route');
  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Return home' }).click();
  await expect(page.getByRole('heading', { name: 'StageGate' })).toBeVisible();
});

test('validates the real API response through the Vite proxy', async ({
  baseURL,
}) => {
  const response = await apiRequest(
    {
      method: 'GET',
      url: '/health',
      baseURL: new URL('/api/v1', baseURL).href,
    },
    healthResponseSchema,
  );
  expect(response).toEqual({ status: 'ok' });
});

test('rejects an HTTP 200 response that fails the shared schema', async () => {
  const { signal } = new AbortController();
  await expect(
    apiRequest(
      {
        method: 'GET',
        url: '/health',
        signal,
        adapter: async (config) => {
          expect(config.baseURL).toBe('/api/v1');
          expect(config.signal).toBe(signal);
          return {
            config,
            data: { status: 'unexpected' },
            headers: {},
            status: 200,
            statusText: 'OK',
          };
        },
      },
      healthResponseSchema,
    ),
  ).rejects.toMatchObject({ name: 'ZodError' });
});
