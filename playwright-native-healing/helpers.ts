import { Page } from '@playwright/test';

export const BASE_URL = process.env.PAGE_URL || 'https://0db08412a5d665.lhr.life/arcane-shop.html';

export async function waitForProducts(page: Page): Promise<void> {
  await page.locator('#product-grid').waitFor({ state: 'attached', timeout: 15_000 });
  await page.getByTestId(/^product-card-/).first().waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForFunction(
    () => {
      const el = document.getElementById('count-shown');
      return !!el && parseInt(el.textContent ?? '0', 10) > 0;
    },
    { timeout: 15_000 }
  );
}
