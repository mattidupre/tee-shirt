import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

const BASE_DIRECTORY = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      'tee-shirt': join(BASE_DIRECTORY, './src/index.ts'),
    },
  },
  test: {
    passWithNoTests: true,
    globals: true,
    include: ['./src/**/*.test.ts', './examples/**/*.ts'],
  },
});
