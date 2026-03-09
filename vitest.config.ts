import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'clover'],
      include: ['app/.vitepress/src/utils/**'],
      exclude: ['node_modules/**', 'dist/**', 'public/**', '**.test.ts'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app/.vitepress/src', import.meta.url)),
    },
  },
});
