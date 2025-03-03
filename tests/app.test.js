// tests/app.test.js

import { test, expect } from '@playwright/test';

test('должен показывать корректный текст на главной странице', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const rssMessage = await page.locator('text=RSS успешно загружен');
  await expect(rssMessage).toBeVisible();
});

test('должен показывать ошибку при неправильном URL', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input[type="url"]', 'invalid-url');
  await page.click('button[type="submit"]');

  const errorMessage = await page.locator('text=Ссылка должна быть валидным URL');
  await expect(errorMessage).toBeVisible();
});

test('должен показывать сообщение о сети при проблемах с подключением', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.route('**/*', (route) => route.abort());

  const networkErrorMessage = await page.locator('text=Ошибка сети');
  await expect(networkErrorMessage).toBeVisible();
});
