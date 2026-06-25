import { test } from '@playwright/test';

test('seed', async ({ page }) => {
  await page.goto('https://laney-petaliferous-dully.ngrok-free.dev/arcane-shop.html');
});