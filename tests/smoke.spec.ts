import { test, expect } from '@playwright/test';

test('smoke: app loads and shows canvas', async ({ page }) => {
  // playwright.config.ts の baseURL を使う。相対パスでOK
  await page.goto('/');                 // 例: https://emoji-smash-phaser-3-rop7.bolt.host/
  await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
});
