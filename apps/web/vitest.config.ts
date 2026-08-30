import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      clearMocks: true,
      restoreMocks: true,
      unstubEnvs: true,
      unstubGlobals: true,
      coverage: {
        provider: 'v8',
        reportsDirectory: './coverage',
        reporter: ['text', 'json-summary', 'html', 'lcov'],
        include: ['src/**/*.{ts, tsx}'],
        exclude: ['src/**/*.d.ts', 'src/main.tsx', 'src/config/environment.ts', 'src/test/**'],
      },
    },
  }),
);
