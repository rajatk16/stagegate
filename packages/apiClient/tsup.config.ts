import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],

  format: ['esm', 'cjs'],

  target: 'es2022',

  platform: 'neutral',

  outDir: 'dist',

  clean: true,

  splitting: false,

  sourcemap: true,

  minify: false,

  treeshake: true,

  dts: true,

  tsconfig: 'tsconfig.build.json',

  external: ['@stagegate/contracts', 'axios', 'zod'],

  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
});
