// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const TEST_URL = process.env.TEST_URL || 'https://emoji-smash-phaser-3-rop7.bolt.host'; // 必要に応じて変更

export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 5_000 },
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: TEST_URL,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 720, height: 1280 },
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'iPhone 12',      use: { ...devices['iPhone 12'] } },
  ],
});
