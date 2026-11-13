import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

import { parseEnvironment } from './src/config/envSchema';

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), 'VITE_');

  parseEnvironment(environment);

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      dedupe: ['react', 'react-dom'],
    },

    server: {
      host: 'localhost',
      port: 3000,
      strictPort: true,
    },

    preview: {
      host: 'localhost',
      port: 4173,
      strictPort: true,
    },

    build: {
      target: 'es2022',
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      manifest: true,
    },
  };
});
