import { test, expect } from '@playwright/test';

test('basic load test', async ({ page }) => {
  // TEST_URL は GitHub Actions で環境変数として渡す想定
  const url = process.env.TEST_URL || 'http://localhost:5173';
  await page.goto(url);

  // タイトルに "Emoji" が含まれているかチェック
  await expect(page).toHaveTitle(/Emoji/i);

  // 画面にキャンバス（ゲーム描画領域）が存在するかチェック
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
});
