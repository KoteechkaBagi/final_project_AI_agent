import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  testMatch: '*.spec.ts',
  timeout: 30000,
  use: {
    baseURL: 'https://worldchess.com',
    headless: true,
    screenshot: 'only-on-failure',
  },
});
