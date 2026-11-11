import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/features',
  use: { baseURL: 'http://127.0.0.1:5173', browserName: 'chromium' },
  webServer: [
    {
      command: 'npm run start:prod --workspace=@stagegate/api',
      env: { PORT: '3000' },
      url: 'http://127.0.0.1:3000/api/v1/me',
    },
    {
      command:
        'npm run dev --workspace=@stagegate/web -- --host 127.0.0.1 --port 5173 --strictPort',
      url: 'http://127.0.0.1:5173',
    },
  ],
});
