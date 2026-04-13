import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  testMatch: '*.spec.ts',
  timeout: 30000,
  reporter: [
    ['list'],
    ['allure-playwright'],
  ],
  use: {
    baseURL: 'https://worldchess.com',
    headless: true,
    screenshot: 'only-on-failure',
  },
});
