import { defineConfig, devices } from '@playwright/test';

const isCi = process.env['CI'] !== undefined;
const baseUrl = isCi ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  ...(isCi ? { workers: 1 } : {}),
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: 'playwright-report',
      },
    ],
  ],
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
  webServer: {
    command: isCi ? 'npm run preview -- --host 127.0.0.1' : 'npm run dev -- --host 127.0.0.1',
    url: baseUrl,
    reuseExistingServer: !isCi,
    timeout: 120_000,
    env: {
      VITE_APP_NAME: 'StageGate',
      VITE_APP_ENV: 'test',
      VITE_API_BASE_URL: 'http://localhost:3000/api/v1',
      VITE_FIREBASE_API_KEY: 'demo-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'demo-stagegate-local.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'demo-stagegate-local',
      VITE_FIREBASE_APP_ID: 'demo-app-id',
      VITE_FIREBASE_USE_AUTH_EMULATOR: 'true',
      VITE_FIREBASE_AUTH_EMULATOR_URL: 'http://127.0.0.1:9099',
    },
  },
});
